import { createKeyValuePair } from "@/lib/tools/shared/http";

import type { ApiExample, ApiRequestConfig } from "./types";

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function defaultApiRequest(): ApiRequestConfig {
	return {
		method: "GET",
		url: "https://jsonplaceholder.typicode.com/users",
		queryParams: [],
		headers: [],
		bodyType: "none",
		body: "",
		formData: [],
		auth: { type: "none" },
	};
}

export function validateRequestUrl(url: string): string | undefined {
	if (!url.trim()) return "Please enter a valid HTTP or HTTPS URL.";

	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return "Please enter a valid HTTP or HTTPS URL.";
		}
		return undefined;
	} catch {
		return "Please enter a valid HTTP or HTTPS URL.";
	}
}

export function isJsonContentType(contentType: string): boolean {
	return /application\/(\w+\+)?json/i.test(contentType);
}

export function looksLikeJson(body: string): boolean {
	const trimmed = body.trim();
	if (!trimmed) return false;

	try {
		JSON.parse(trimmed);
		return true;
	} catch {
		return false;
	}
}

export const API_EXAMPLES: ApiExample[] = [
	{
		name: "GET Users",
		request: { ...defaultApiRequest(), method: "GET", url: "https://jsonplaceholder.typicode.com/users" },
	},
	{
		name: "GET Post",
		request: { ...defaultApiRequest(), method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
	},
	{
		name: "POST",
		request: {
			...defaultApiRequest(),
			method: "POST",
			url: "https://jsonplaceholder.typicode.com/posts",
			bodyType: "json",
			body: JSON.stringify({ title: "Developer Tools", body: "Testing API", userId: 1 }, null, 2),
			headers: [createKeyValuePair("Content-Type", "application/json")],
		},
	},
	{
		name: "Query Parameters",
		request: {
			...defaultApiRequest(),
			method: "GET",
			url: "https://jsonplaceholder.typicode.com/posts",
			queryParams: [createKeyValuePair("userId", "1")],
		},
	},
];
