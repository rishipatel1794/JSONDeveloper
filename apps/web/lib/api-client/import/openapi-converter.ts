import { createKeyValuePair, type AuthConfig, type KeyValuePair } from "@/lib/tools/shared/http";

import type { ApiBodyType } from "../types";
import { createVariable } from "../storage/variables";
import type { Collection, Folder, SavedApiRequest, Variable } from "../workspace/types";
import { isPlainObject } from "./openapi-parser";
import { convertParameters } from "./parameter-converter";
import { generateSchemaExample } from "./schema-generator";
import { convertServers } from "./server-converter";
import { resolveEffectiveSecurity, suggestVariablesForAuth } from "./security-converter";
import type {
	ImportedApiDefinition,
	ImportedAuth,
	ImportedFolder,
	ImportedParameter,
	ImportedRequest,
	ImportedRequestBody,
	ImportedServer,
	ImportedVariableSuggestion,
	OpenApiFormat,
	OpenApiVersion,
	SkippedEndpoint,
} from "./types";

const RAW_METHOD_KEYS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"] as const;
const SUPPORTED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const SUPPORTED_CONTENT_TYPES = ["application/json", "application/x-www-form-urlencoded", "text/plain"];

function extractExampleValue(mediaTypeObject: Record<string, unknown>): unknown {
	if (mediaTypeObject.example !== undefined) return mediaTypeObject.example;
	if (isPlainObject(mediaTypeObject.examples)) {
		const first = Object.values(mediaTypeObject.examples)[0];
		if (isPlainObject(first) && "value" in first) return first.value;
	}
	return undefined;
}

function convertRequestBodyOpenApi3(requestBody: unknown): { body?: ImportedRequestBody; warning?: string } {
	if (!isPlainObject(requestBody)) return {};

	const content = isPlainObject(requestBody.content) ? requestBody.content : {};
	const contentTypeKeys = Object.keys(content);
	if (contentTypeKeys.length === 0) return {};

	const chosenType = SUPPORTED_CONTENT_TYPES.find(type => contentTypeKeys.includes(type));
	if (!chosenType) {
		return { warning: `Unsupported request body content type: ${contentTypeKeys[0]}` };
	}

	const mediaTypeObject = content[chosenType];
	if (!isPlainObject(mediaTypeObject)) return {};

	const bodyType: ImportedRequestBody["bodyType"] =
		chosenType === "application/json" ? "json" : chosenType === "application/x-www-form-urlencoded" ? "form-urlencoded" : "raw";

	const explicitExample = extractExampleValue(mediaTypeObject);
	if (explicitExample !== undefined) {
		return { body: { contentType: chosenType, value: explicitExample, bodyType, isExplicit: true } };
	}

	const generated = generateSchemaExample(mediaTypeObject.schema);
	return { body: { contentType: chosenType, value: generated, bodyType, isExplicit: false } };
}

/** Swagger 2 represents bodies via a "body"-location parameter, or discrete "formData" parameters — no `requestBody`. */
function convertRequestBodySwagger2(parameters: unknown[]): ImportedRequestBody | undefined {
	const bodyParam = parameters.find(param => isPlainObject(param) && param.in === "body");
	if (isPlainObject(bodyParam)) {
		const explicit = extractExampleValue(bodyParam);
		if (explicit !== undefined) return { contentType: "application/json", value: explicit, bodyType: "json", isExplicit: true };
		return { contentType: "application/json", value: generateSchemaExample(bodyParam.schema), bodyType: "json", isExplicit: false };
	}

	const formParams = parameters.filter(param => isPlainObject(param) && param.in === "formData");
	if (formParams.length === 0) return undefined;

	const value: Record<string, unknown> = {};
	for (const param of formParams) {
		if (isPlainObject(param) && typeof param.name === "string") {
			value[param.name] = param.default ?? generateSchemaExample(param) ?? "";
		}
	}
	return { contentType: "application/x-www-form-urlencoded", value, bodyType: "form-urlencoded", isExplicit: false };
}

function humanizeOperationId(id: string): string {
	const spaced = id
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.trim();
	return spaced.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function deriveRequestName(operation: Record<string, unknown>, method: string, path: string): string {
	if (typeof operation.operationId === "string" && operation.operationId.trim()) {
		return humanizeOperationId(operation.operationId.trim());
	}
	if (typeof operation.summary === "string" && operation.summary.trim()) {
		return operation.summary.trim();
	}
	return `${method} ${path}`;
}

function deriveFolderName(tags: unknown, path: string): string {
	if (Array.isArray(tags) && typeof tags[0] === "string" && tags[0].trim()) {
		return tags[0].trim();
	}
	const firstSegment = path.split("/").filter(Boolean)[0];
	if (!firstSegment) return "General";
	const cleaned = firstSegment.replace(/[{}]/g, "");
	if (!cleaned) return "General";
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function convertPathToVariableUrl(path: string): string {
	return path.replace(/\{([^}]+)\}/g, (_match, name: string) => `{{${name}}}`);
}

function mergeParameters(shared: unknown[], operationLevel: unknown[]): unknown[] {
	const merged = [...shared];
	for (const opParam of operationLevel) {
		if (!isPlainObject(opParam)) continue;
		const existingIndex = merged.findIndex(candidate => isPlainObject(candidate) && candidate.name === opParam.name && candidate.in === opParam.in);
		if (existingIndex > -1) merged[existingIndex] = opParam;
		else merged.push(opParam);
	}
	return merged;
}

/** Parses a resolved OpenAPI/Swagger document into our normalized intermediate representation. Pure — no React, no I/O. */
export function buildApiDefinition(document: Record<string, unknown>, version: OpenApiVersion, format: OpenApiFormat): ImportedApiDefinition {
	const info = isPlainObject(document.info) ? document.info : {};
	const title = typeof info.title === "string" && info.title.trim() ? info.title.trim() : "Imported API";
	const specVersion = typeof info.version === "string" ? info.version : "1.0.0";
	const description = typeof info.description === "string" ? info.description : undefined;

	const servers = convertServers(document, version);

	const securitySchemes = isPlainObject(document.components) && isPlainObject(document.components.securitySchemes)
		? document.components.securitySchemes
		: isPlainObject(document.securityDefinitions)
			? document.securityDefinitions
			: {};

	const globalSecurity = document.security;
	const paths = isPlainObject(document.paths) ? document.paths : {};

	const foldersByName = new Map<string, ImportedFolder>();
	const skipped: SkippedEndpoint[] = [];
	const authSuggestionsByKey = new Map<string, ImportedVariableSuggestion[]>();

	for (const [path, rawPathItem] of Object.entries(paths)) {
		if (!isPlainObject(rawPathItem)) continue;

		const sharedParameters = Array.isArray(rawPathItem.parameters) ? rawPathItem.parameters : [];

		for (const methodKey of RAW_METHOD_KEYS) {
			const rawOperation = rawPathItem[methodKey];
			if (!isPlainObject(rawOperation)) continue;

			const method = methodKey.toUpperCase();

			if (!SUPPORTED_METHODS.has(method)) {
				skipped.push({ method, path, reason: "Unsupported HTTP method" });
				continue;
			}

			const operationParameters = Array.isArray(rawOperation.parameters) ? rawOperation.parameters : [];
			const mergedParametersRaw = mergeParameters(sharedParameters, operationParameters);
			const parameters: ImportedParameter[] = convertParameters(mergedParametersRaw);

			let body: ImportedRequestBody | undefined;
			if (version === "swagger2") {
				body = convertRequestBodySwagger2(mergedParametersRaw);
			} else {
				const converted = convertRequestBodyOpenApi3(rawOperation.requestBody);
				body = converted.body;
				if (converted.warning) skipped.push({ method, path, reason: converted.warning });
			}

			const auth: ImportedAuth = resolveEffectiveSecurity(globalSecurity, rawOperation.security, securitySchemes);
			const authKey = JSON.stringify(auth);
			if (auth.type !== "none" && !authSuggestionsByKey.has(authKey)) {
				authSuggestionsByKey.set(authKey, suggestVariablesForAuth(auth));
			}

			const importedRequest: ImportedRequest = {
				previewId: crypto.randomUUID(),
				name: deriveRequestName(rawOperation, method, path),
				method,
				path,
				url: convertPathToVariableUrl(path),
				tag: Array.isArray(rawOperation.tags) && typeof rawOperation.tags[0] === "string" ? rawOperation.tags[0] : undefined,
				operationId: typeof rawOperation.operationId === "string" ? rawOperation.operationId : undefined,
				summary: typeof rawOperation.summary === "string" ? rawOperation.summary : undefined,
				description: typeof rawOperation.description === "string" ? rawOperation.description : undefined,
				deprecated: rawOperation.deprecated === true,
				parameters,
				body,
				auth,
				supported: true,
			};

			const folderName = deriveFolderName(rawOperation.tags, path);
			const folder = foldersByName.get(folderName) ?? { name: folderName, requests: [] };
			folder.requests.push(importedRequest);
			foldersByName.set(folderName, folder);
		}
	}

	const suggestedVariables = [...new Map([...authSuggestionsByKey.values()].flat().map(variable => [variable.name, variable])).values()];

	return {
		title,
		version: specVersion,
		description,
		servers,
		folders: [...foldersByName.values()],
		suggestedVariables,
		skipped,
		sourceFormat: format,
		sourceVersion: version,
	};
}

// ---------------------------------------------------------------------------------------------
// ImportedApiDefinition (+ user selection/options) -> actual workspace records ready for storage
// ---------------------------------------------------------------------------------------------

export interface ImportOptions {
	generateBodies: boolean;
	selectedServerIndex: number;
	selectedVariableNames: Set<string>;
}

export interface WorkspaceImportResult {
	collection: Collection;
	folders: Folder[];
	requests: SavedApiRequest[];
	environmentVariables: Variable[];
	skippedCount: number;
}

function buildRequestAuth(auth: ImportedAuth): AuthConfig {
	if (auth.type === "bearer") return { type: "bearer", token: "{{ACCESS_TOKEN}}" };
	if (auth.type === "basic") return { type: "basic", username: "{{USERNAME}}", password: "{{PASSWORD}}" };
	if (auth.type === "api-key") return { type: "api-key", key: auth.key, value: "{{API_KEY}}", location: auth.location };
	return { type: "none" };
}

function shapeBody(body: ImportedRequestBody | undefined, generateBodies: boolean): { bodyType: ApiBodyType; body: string; formData: KeyValuePair[] } {
	if (!body || (!body.isExplicit && !generateBodies)) {
		return { bodyType: "none", body: "", formData: [] };
	}

	if (body.bodyType === "form-urlencoded") {
		const formData: KeyValuePair[] = isPlainObject(body.value)
			? Object.entries(body.value).map(([key, value]) => createKeyValuePair(key, value === undefined || value === null ? "" : String(value)))
			: [];
		return { bodyType: "form-urlencoded", body: "", formData };
	}

	const text =
		typeof body.value === "string" ? body.value : body.value === undefined || body.value === null ? "" : JSON.stringify(body.value, null, 2);

	return { bodyType: body.bodyType === "json" ? "json" : "raw", body: text, formData: [] };
}

export function mapToWorkspaceRecords(
	definition: ImportedApiDefinition,
	selectedIds: Set<string>,
	options: ImportOptions,
	collectionName: string,
	collectionDescription: string | undefined,
): WorkspaceImportResult {
	const now = new Date().toISOString();
	const collectionId = crypto.randomUUID();

	const server: ImportedServer | undefined = definition.servers[options.selectedServerIndex] ?? definition.servers[0];
	const baseUrl = server?.url ?? "https://api.example.com";

	const pathParamVariables = new Map<string, Variable>();
	const folders: Folder[] = [];
	const requests: SavedApiRequest[] = [];
	let skippedCount = definition.skipped.length;

	for (const importedFolder of definition.folders) {
		const selectedRequests = importedFolder.requests.filter(request => selectedIds.has(request.previewId));
		skippedCount += importedFolder.requests.length - selectedRequests.length;
		if (selectedRequests.length === 0) continue;

		const folder: Folder = {
			id: crypto.randomUUID(),
			name: importedFolder.name,
			collectionId,
			createdAt: now,
		};
		folders.push(folder);

		for (const importedRequest of selectedRequests) {
			const queryParams: KeyValuePair[] = [];
			const headers: KeyValuePair[] = [];

			for (const param of importedRequest.parameters) {
				if (param.in === "path") {
					if (!pathParamVariables.has(param.name)) {
						pathParamVariables.set(param.name, createVariable(param.name, param.value, false));
					}
				} else if (param.in === "query") {
					queryParams.push(createKeyValuePair(param.name, param.value));
				} else if (param.in === "header") {
					headers.push(createKeyValuePair(param.name, param.value));
				}
			}

			const { bodyType, body, formData } = shapeBody(importedRequest.body, options.generateBodies);

			const request: SavedApiRequest = {
				id: crypto.randomUUID(),
				name: importedRequest.deprecated ? `${importedRequest.name} (Deprecated)` : importedRequest.name,
				method: importedRequest.method as SavedApiRequest["method"],
				url: `{{BASE_URL}}${importedRequest.url}`,
				queryParams,
				headers,
				bodyType,
				body,
				formData,
				auth: buildRequestAuth(importedRequest.auth),
				collectionId,
				folderId: folder.id,
				extractionRules: [],
				autoExtract: false,
				createdAt: now,
				updatedAt: now,
			};

			requests.push(request);
		}
	}

	const collectionVariables: Variable[] = [...pathParamVariables.values()];

	const collection: Collection = {
		id: collectionId,
		name: collectionName,
		description: collectionDescription,
		variables: collectionVariables,
		createdAt: now,
		updatedAt: now,
	};

	const environmentVariables: Variable[] = [createVariable("BASE_URL", baseUrl, false)];

	for (const serverVariable of server?.variables ?? []) {
		environmentVariables.push(createVariable(serverVariable.name.toUpperCase(), serverVariable.default, false));
	}

	for (const suggestion of definition.suggestedVariables) {
		if (options.selectedVariableNames.has(suggestion.name)) {
			environmentVariables.push(createVariable(suggestion.name, "", suggestion.secret));
		}
	}

	return { collection, folders, requests, environmentVariables, skippedCount };
}
