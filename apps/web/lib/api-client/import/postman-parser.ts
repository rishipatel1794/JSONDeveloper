import { isPlainObject } from "./openapi-parser";
import type { PostmanCollection } from "./postman-types";

const MAX_COLLECTION_SIZE_BYTES = 10 * 1024 * 1024;

const INVALID_MESSAGE = "Unable to import this Postman collection.\n\nPlease verify that the file is a valid Postman Collection v2.0/v2.1 export.";

export interface ParsedPostmanResult {
	success: boolean;
	collection?: PostmanCollection;
	error?: string;
}

function looksLikePostmanSchema(schema: unknown): boolean {
	return typeof schema === "string" && /schema\.getpostman\.com\/json\/collection\/v2\.[01]/.test(schema);
}

export function parsePostmanCollection(text: string): ParsedPostmanResult {
	if (new TextEncoder().encode(text).length > MAX_COLLECTION_SIZE_BYTES) {
		return { success: false, error: "This collection is too large to import.\n\nMaximum supported size is 10 MB." };
	}

	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch (error) {
		return { success: false, error: `${INVALID_MESSAGE}\n\nDetails: ${error instanceof Error ? error.message : "Invalid JSON."}` };
	}

	if (!isPlainObject(data)) {
		return { success: false, error: INVALID_MESSAGE };
	}

	if (!isPlainObject(data.info) || !looksLikePostmanSchema(data.info.schema)) {
		return { success: false, error: `${INVALID_MESSAGE} (Missing or unrecognized "info.schema".)` };
	}

	if (!Array.isArray(data.item)) {
		return { success: false, error: `${INVALID_MESSAGE} (Missing "item" array.)` };
	}

	return { success: true, collection: data as PostmanCollection };
}
