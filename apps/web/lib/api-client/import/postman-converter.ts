import { createKeyValuePair, type AuthConfig, type KeyValuePair } from "@/lib/tools/shared/http";

import { nameSuggestsSecret } from "../storage/variables";
import type { ApiBodyType } from "../types";
import type { DirectApiDefinition, DirectImportedFolder, DirectImportedRequest, ImportedVariableSuggestion, SkippedEndpoint } from "./types";
import type { PostmanAuth, PostmanBody, PostmanCollection, PostmanFormParam, PostmanItem, PostmanUrl, PostmanVariable } from "./postman-types";

const VARIABLE_REF_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

function stringifyValue(value: unknown): string {
	if (value === undefined || value === null) return "";
	return typeof value === "string" ? value : String(value);
}

function getAuthParam(auth: PostmanAuth, scheme: string, key: string): string {
	const params = auth[scheme];
	if (!Array.isArray(params)) return "";
	const match = params.find((param): param is { key: string; value?: unknown } => isRecord(param) && param.key === key);
	return match ? stringifyValue(match.value) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

/** Converts one Postman auth block. Returns undefined when there's nothing explicit here (caller should inherit from its parent). */
function convertAuth(auth: PostmanAuth | null | undefined): { auth: AuthConfig; unsupported?: string } | undefined {
	if (!auth) return undefined;

	switch (auth.type) {
		case "noauth":
			return { auth: { type: "none" } };
		case "bearer":
			return { auth: { type: "bearer", token: getAuthParam(auth, "bearer", "token") } };
		case "basic":
			return { auth: { type: "basic", username: getAuthParam(auth, "basic", "username"), password: getAuthParam(auth, "basic", "password") } };
		case "apikey": {
			const location = getAuthParam(auth, "apikey", "in");
			return {
				auth: { type: "api-key", key: getAuthParam(auth, "apikey", "key"), value: getAuthParam(auth, "apikey", "value"), location: location === "query" ? "query" : "header" },
			};
		}
		default:
			return { auth: { type: "none" }, unsupported: auth.type };
	}
}

function pathVariablesToVariableSyntax(path: string): string {
	return path.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, "{{$1}}");
}

interface ConvertedUrl {
	url: string;
	queryParams: KeyValuePair[];
	pathVariables: PostmanVariable[];
}

function splitRawUrl(raw: string): { path: string; query: KeyValuePair[] } {
	const qIndex = raw.indexOf("?");
	if (qIndex === -1) return { path: raw, query: [] };

	const path = raw.slice(0, qIndex);
	const query = raw
		.slice(qIndex + 1)
		.split("&")
		.filter(Boolean)
		.map(pair => {
			const eq = pair.indexOf("=");
			return eq === -1 ? createKeyValuePair(pair, "") : createKeyValuePair(pair.slice(0, eq), pair.slice(eq + 1));
		});

	return { path, query };
}

function convertUrl(url: PostmanUrl | string | undefined): ConvertedUrl {
	if (!url) return { url: "", queryParams: [], pathVariables: [] };

	if (typeof url === "string") {
		const { path, query } = splitRawUrl(url);
		return { url: pathVariablesToVariableSyntax(path), queryParams: query, pathVariables: [] };
	}

	const raw = url.raw ?? [url.protocol ? `${url.protocol}://` : "", Array.isArray(url.host) ? url.host.join(".") : (url.host ?? ""), "/", Array.isArray(url.path) ? url.path.join("/") : (url.path ?? "")].join("");

	const split = splitRawUrl(raw);
	const path = split.path;

	const queryParams = Array.isArray(url.query)
		? url.query.filter(param => param.key !== undefined).map(param => ({ ...createKeyValuePair(param.key ?? "", param.value ?? ""), enabled: !param.disabled }))
		: split.query;

	return { url: pathVariablesToVariableSyntax(path), queryParams, pathVariables: url.variable ?? [] };
}

function isJsonLike(value: string): boolean {
	try {
		JSON.parse(value);
		return true;
	} catch {
		return false;
	}
}

function convertFormParams(params: PostmanFormParam[] | undefined): KeyValuePair[] {
	if (!params) return [];
	return params.map(param => {
		const isFile = param.type === "file";
		// Postman only stores a source path for file fields — there's no content to import, so it
		// comes through as an empty text field for the user to re-attach.
		const pair = createKeyValuePair(param.key ?? "", isFile ? "" : (param.value ?? ""), "text");
		return { ...pair, enabled: !param.disabled };
	});
}

interface ConvertedBody {
	bodyType: ApiBodyType;
	body: string;
	formData: KeyValuePair[];
}

function convertBody(body: PostmanBody | undefined): ConvertedBody {
	if (!body || !body.mode) return { bodyType: "none", body: "", formData: [] };

	switch (body.mode) {
		case "raw": {
			const text = body.raw ?? "";
			const language = body.options?.raw?.language;
			const isJson = language === "json" || (!language && text.trim().startsWith("{") && isJsonLike(text));
			return { bodyType: isJson ? "json" : "raw", body: text, formData: [] };
		}
		case "urlencoded":
			return { bodyType: "form-urlencoded", body: "", formData: convertFormParams(body.urlencoded) };
		case "formdata":
			return { bodyType: "form-data", body: "", formData: convertFormParams(body.formdata) };
		case "graphql": {
			let variables: unknown = {};
			try {
				variables = body.graphql?.variables ? JSON.parse(body.graphql.variables) : {};
			} catch {
				variables = {};
			}
			return { bodyType: "json", body: JSON.stringify({ query: body.graphql?.query ?? "", variables }, null, 2), formData: [] };
		}
		default:
			return { bodyType: "none", body: "", formData: [] };
	}
}

function scanVariableRefs(...values: string[]): Set<string> {
	const found = new Set<string>();
	for (const value of values) {
		const pattern = new RegExp(VARIABLE_REF_PATTERN.source, "g");
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(value))) {
			if (match[1]) found.add(match[1]);
		}
	}
	return found;
}

/** Parses a validated Postman Collection document into our normalized "direct" import representation. */
export function buildDefinitionFromPostman(collection: PostmanCollection): DirectApiDefinition {
	const title = collection.info?.name?.trim() || "Imported Collection";

	const foldersByName = new Map<string, DirectImportedFolder>();
	const skipped: SkippedEndpoint[] = [];
	const referencedNames = new Set<string>();
	const pathVariablesByName = new Map<string, PostmanVariable>();
	const unsupportedAuthTypes = new Set<string>();

	function walk(items: PostmanItem[], folderPath: string[], inheritedAuth: AuthConfig) {
		for (const item of items) {
			if (Array.isArray(item.item)) {
				const nextAuth = convertAuth(item.auth)?.auth ?? inheritedAuth;
				walk(item.item, item.name ? [...folderPath, item.name] : folderPath, nextAuth);
				continue;
			}

			if (!item.request) continue;

			const request = item.request;
			const method = (request.method ?? "GET").toUpperCase();

			const { url, queryParams, pathVariables } = convertUrl(request.url);
			for (const pathVariable of pathVariables) {
				if (pathVariable.key) pathVariablesByName.set(pathVariable.key, pathVariable);
			}

			const headers: KeyValuePair[] = (request.header ?? [])
				.filter(header => header.key)
				.map(header => ({ ...createKeyValuePair(header.key, header.value ?? ""), enabled: !header.disabled }));

			const { bodyType, body, formData } = convertBody(request.body);

			const authResult = convertAuth(request.auth) ?? { auth: inheritedAuth };
			if (authResult.unsupported) unsupportedAuthTypes.add(authResult.unsupported);

			scanVariableRefs(url, body, ...headers.map(h => h.value), ...queryParams.map(q => q.value)).forEach(name => referencedNames.add(name));

			const directRequest: DirectImportedRequest = {
				previewId: crypto.randomUUID(),
				name: item.name?.trim() || `${method} ${url}`,
				method,
				deprecated: false,
				url,
				queryParams,
				headers,
				bodyType,
				body,
				formData,
				auth: authResult.auth,
			};

			const folderName = folderPath.length ? folderPath.join(" / ") : "General";
			const folder = foldersByName.get(folderName) ?? { name: folderName, requests: [] };
			folder.requests.push(directRequest);
			foldersByName.set(folderName, folder);
		}
	}

	const collectionAuth = convertAuth(collection.auth)?.auth ?? { type: "none" };
	walk(collection.item ?? [], [], collectionAuth);

	if (unsupportedAuthTypes.size > 0) {
		skipped.push({
			method: "-",
			path: "-",
			reason: `Unsupported auth type(s) — configure manually: ${[...unsupportedAuthTypes].join(", ")}`,
		});
	}

	const collectionVariableNames = new Set<string>();
	const suggestedVariables: ImportedVariableSuggestion[] = [];

	for (const variable of collection.variable ?? []) {
		if (!variable.key || variable.disabled) continue;
		collectionVariableNames.add(variable.key);
		suggestedVariables.push({ name: variable.key, secret: nameSuggestsSecret(variable.key), suggestedDefault: stringifyValue(variable.value) });
	}

	for (const name of referencedNames) {
		if (collectionVariableNames.has(name)) continue;
		const pathVariable = pathVariablesByName.get(name);
		suggestedVariables.push({ name, secret: nameSuggestsSecret(name), suggestedDefault: pathVariable ? stringifyValue(pathVariable.value) : "" });
	}

	return {
		title,
		folders: [...foldersByName.values()],
		suggestedVariables,
		skipped,
		sourceKind: "postman",
	};
}
