import * as yaml from "js-yaml";

import type { OpenApiFormat, OpenApiVersion, ParsedSpecResult } from "./types";

const MAX_SPEC_SIZE_BYTES = 10 * 1024 * 1024;

const INVALID_DOCUMENT_MESSAGE = "Unable to import API specification.\n\nPlease verify that the file is a valid OpenAPI or Swagger document.";
const UNSUPPORTED_VERSION_MESSAGE = "Unsupported specification version.\n\nSupported versions:\nOpenAPI 3.0\nOpenAPI 3.1\nSwagger 2.0";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function detectFormat(text: string): OpenApiFormat {
	const trimmed = text.trim();
	return trimmed.startsWith("{") || trimmed.startsWith("[") ? "json" : "yaml";
}

function parseText(text: string, format: OpenApiFormat): { success: true; data: unknown } | { success: false; error: string } {
	try {
		if (format === "json") {
			return { success: true, data: JSON.parse(text) };
		}

		// js-yaml's load() uses the safe DEFAULT_SCHEMA — it never registers or executes custom/JS
		// constructor tags, unlike the historical (and separately-named) unsafe loaders in other libraries.
		return { success: true, data: yaml.load(text) };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "Unable to parse the document." };
	}
}

function detectVersion(doc: Record<string, unknown>): OpenApiVersion | null {
	if (typeof doc.openapi === "string") {
		if (doc.openapi.startsWith("3.1")) return "openapi3.1";
		if (doc.openapi.startsWith("3.0")) return "openapi3.0";
		return null;
	}
	if (typeof doc.swagger === "string" && doc.swagger.startsWith("2")) return "swagger2";
	return null;
}

/**
 * Resolves LOCAL $ref pointers only (e.g. #/components/schemas/User or #/definitions/User).
 * Never follows a remote URL or file path — an unresolvable/non-local $ref is left as an empty
 * object rather than fetched, so import never triggers a network request.
 */
export function resolveLocalRefs(doc: Record<string, unknown>): Record<string, unknown> {
	function resolvePointer(pointer: string): unknown {
		if (!pointer.startsWith("#/")) return undefined;

		const segments = pointer
			.slice(2)
			.split("/")
			.map(segment => decodeURIComponent(segment).replace(/~1/g, "/").replace(/~0/g, "~"));

		let current: unknown = doc;
		for (const segment of segments) {
			if (Array.isArray(current)) {
				current = current[Number(segment)];
			} else if (isPlainObject(current)) {
				current = current[segment];
			} else {
				return undefined;
			}
		}
		return current;
	}

	function walk(node: unknown, activeRefs: Set<string>, depth: number): unknown {
		if (depth > 80) return node;
		if (Array.isArray(node)) return node.map(item => walk(item, activeRefs, depth + 1));
		if (!isPlainObject(node)) return node;

		if (typeof node.$ref === "string") {
			const pointer = node.$ref;
			if (activeRefs.has(pointer)) return {}; // genuine cycle within this resolution chain
			const resolved = resolvePointer(pointer);
			if (resolved === undefined) return {};

			const nextActive = new Set(activeRefs);
			nextActive.add(pointer);
			return walk(resolved, nextActive, depth + 1);
		}

		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(node)) {
			result[key] = walk(value, activeRefs, depth + 1);
		}
		return result;
	}

	return walk(doc, new Set(), 0) as Record<string, unknown>;
}

export function parseOpenApiSpec(text: string): ParsedSpecResult {
	if (new TextEncoder().encode(text).length > MAX_SPEC_SIZE_BYTES) {
		return { success: false, error: "This API specification is too large to import.\n\nMaximum supported size is 10 MB." };
	}

	const format = detectFormat(text);
	const parsed = parseText(text, format);

	if (!parsed.success) {
		return { success: false, error: `${INVALID_DOCUMENT_MESSAGE}\n\nDetails: ${parsed.error}` };
	}

	if (!isPlainObject(parsed.data)) {
		return { success: false, error: INVALID_DOCUMENT_MESSAGE };
	}

	const version = detectVersion(parsed.data);
	if (!version) {
		return { success: false, error: UNSUPPORTED_VERSION_MESSAGE };
	}

	if (!isPlainObject(parsed.data.info) || typeof parsed.data.info.title !== "string") {
		return { success: false, error: `${INVALID_DOCUMENT_MESSAGE} (Missing "info.title".)` };
	}

	if (!isPlainObject(parsed.data.paths)) {
		return { success: false, error: `${INVALID_DOCUMENT_MESSAGE} (Missing "paths".)` };
	}

	const resolved = resolveLocalRefs(parsed.data);

	return { success: true, document: resolved, version, format };
}
