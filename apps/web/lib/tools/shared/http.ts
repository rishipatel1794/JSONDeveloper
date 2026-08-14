/**
 * Domain primitives shared by every tool that models an HTTP request (cURL Generator, API Client,
 * and future tools). Kept separate from any single tool's lib folder so it isn't awkward for a
 * second consumer to depend on "someone else's" types.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export interface KeyValuePair {
	id: string;
	key: string;
	value: string;
	enabled: boolean;
	/** Only meaningful for multipart form fields. */
	type?: "text" | "file";
	/** Only meaningful when type is "file" — `value` holds the file content as a data URL, this holds its original name. */
	fileName?: string;
}

export function createKeyValuePair(key = "", value = "", type?: "text" | "file"): KeyValuePair {
	return { id: crypto.randomUUID(), key, value, enabled: true, ...(type ? { type } : {}) };
}

export type AuthConfig =
	| { type: "none" }
	| { type: "bearer"; token: string }
	| { type: "basic"; username: string; password: string }
	| { type: "api-key"; key: string; value: string; location: "header" | "query" };
