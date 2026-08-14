import type { CurlExample, CurlRequest } from "./types";
import type { KeyValuePair } from "../shared/http";
import { createKeyValuePair } from "../shared/http";

export { createKeyValuePair };

export function defaultCurlRequest(): CurlRequest {
	return {
		method: "GET",
		url: "https://api.example.com/",
		queryParams: [],
		headers: [],
		bodyType: "none",
		body: "",
		formData: [],
		auth: { type: "none" },
		followRedirects: false,
		compressed: false,
		insecure: false,
		cookies: "",
		userAgent: "",
	};
}

/**
 * Bash/Zsh-safe single-quote escaping. Everything inside single quotes is literal in POSIX shells
 * except a single quote itself, which is closed, escaped, and reopened: ' -> '\''
 */
export function escapeBashArg(value: string): string {
	return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
 * PowerShell-safe single-quoted (literal) string escaping — avoids $-expansion and backtick
 * interpretation entirely, unlike double-quoted PowerShell strings. Embedded ' is doubled.
 */
export function escapePowerShellArg(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Builds the final request URL from a base URL, enabled query params, and an optional extra
 * param (used for query-based API key auth), merging with any query string already in the URL.
 */
export function buildRequestUrl(baseUrl: string, queryParams: KeyValuePair[], extraParam?: { key: string; value: string }): string {
	if (!baseUrl.trim()) return "";

	let url: URL;
	try {
		url = new URL(baseUrl);
	} catch {
		return baseUrl;
	}

	for (const param of queryParams) {
		if (param.enabled && param.key) {
			url.searchParams.set(param.key, param.value);
		}
	}

	if (extraParam?.key) {
		url.searchParams.set(extraParam.key, extraParam.value);
	}

	// URLSearchParams encodes spaces as '+' (form convention); any literal '+' from user input is
	// already escaped to %2B by set(), so every remaining '+' unambiguously represents a space.
	if (url.search) {
		url.search = url.search.replace(/\+/g, "%20");
	}

	return url.toString();
}

export const CURL_EXAMPLES: CurlExample[] = [
	{
		name: "GET API",
		request: {
			...defaultCurlRequest(),
			method: "GET",
			url: "https://jsonplaceholder.typicode.com/users",
		},
	},
	{
		name: "POST JSON",
		request: {
			...defaultCurlRequest(),
			method: "POST",
			url: "https://api.example.com/users",
			bodyType: "json",
			body: JSON.stringify({ name: "John Doe", email: "john@example.com" }, null, 2),
			headers: [createKeyValuePair("Content-Type", "application/json")],
		},
	},
	{
		name: "Bearer Auth",
		request: {
			...defaultCurlRequest(),
			method: "GET",
			url: "https://api.example.com/profile",
			auth: { type: "bearer", token: "your-token-here" },
		},
	},
	{
		name: "Query Parameters",
		request: {
			...defaultCurlRequest(),
			method: "GET",
			url: "https://api.example.com/search",
			queryParams: [createKeyValuePair("q", "developer"), createKeyValuePair("page", "1"), createKeyValuePair("limit", "20")],
		},
	},
];
