import type { AuthConfig, KeyValuePair } from "@/lib/tools/shared/http";

import type { Collection, Folder, SavedApiRequest } from "../workspace/types";
import { buildFolderTree, type FolderNode } from "../workspace/tree";

const POSTMAN_SCHEMA = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";

function convertHeaders(headers: KeyValuePair[]): Record<string, unknown>[] {
	return headers.map(header => ({ key: header.key, value: header.value, disabled: !header.enabled }));
}

function convertFormParams(items: KeyValuePair[]): Record<string, unknown>[] {
	return items.map(item => ({
		key: item.key,
		value: item.type === "file" ? undefined : item.value,
		type: item.type === "file" ? "file" : "text",
		disabled: !item.enabled,
	}));
}

function convertBody(request: SavedApiRequest): Record<string, unknown> | undefined {
	switch (request.bodyType) {
		case "none":
			return undefined;
		case "json":
			return { mode: "raw", raw: request.body, options: { raw: { language: "json" } } };
		case "raw":
			return { mode: "raw", raw: request.body, options: { raw: { language: "text" } } };
		case "form-urlencoded":
			return { mode: "urlencoded", urlencoded: convertFormParams(request.formData) };
		case "form-data":
			return { mode: "formdata", formdata: convertFormParams(request.formData) };
		default:
			return undefined;
	}
}

function convertAuth(auth: AuthConfig): Record<string, unknown> {
	switch (auth.type) {
		case "bearer":
			return { type: "bearer", bearer: [{ key: "token", value: auth.token, type: "string" }] };
		case "basic":
			return {
				type: "basic",
				basic: [
					{ key: "username", value: auth.username, type: "string" },
					{ key: "password", value: auth.password, type: "string" },
				],
			};
		case "api-key":
			return {
				type: "apikey",
				apikey: [
					{ key: "key", value: auth.key, type: "string" },
					{ key: "value", value: auth.value, type: "string" },
					{ key: "in", value: auth.location, type: "string" },
				],
			};
		default:
			return { type: "noauth" };
	}
}

function buildUrl(request: SavedApiRequest): Record<string, unknown> {
	const enabledParams = request.queryParams.filter(param => param.enabled && param.key);
	const query = enabledParams.length > 0 ? `?${enabledParams.map(param => `${param.key}=${param.value}`).join("&")}` : "";

	return {
		raw: `${request.url}${query}`,
		query: enabledParams.map(param => ({ key: param.key, value: param.value, disabled: !param.enabled })),
	};
}

function convertRequest(request: SavedApiRequest): Record<string, unknown> {
	return {
		name: request.name,
		request: {
			method: request.method,
			header: convertHeaders(request.headers),
			url: buildUrl(request),
			auth: convertAuth(request.auth),
			body: convertBody(request),
		},
	};
}

function convertFolderNode(node: FolderNode): Record<string, unknown> {
	return {
		name: node.folder.name,
		item: [...node.children.map(convertFolderNode), ...node.requests.map(convertRequest)],
	};
}

/** Builds a Postman Collection v2.1 document for one collection, ready to serialize and download. */
export function buildPostmanCollection(collection: Collection, folders: Folder[], requests: SavedApiRequest[], includeSecrets = false): Record<string, unknown> {
	const tree = buildFolderTree(collection.id, folders, requests);

	const variables = collection.variables
		.filter(variable => includeSecrets || !variable.secret)
		.map(variable => ({ key: variable.key, value: variable.value, type: "string" }));

	return {
		info: {
			name: collection.name,
			description: collection.description,
			schema: POSTMAN_SCHEMA,
		},
		item: [...tree.rootFolders.map(convertFolderNode), ...tree.rootRequests.map(convertRequest)],
		variable: variables,
	};
}
