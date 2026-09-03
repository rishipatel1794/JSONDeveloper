import type { ApiRequestConfig, ApiResponse } from "./types";
import { parseDataUrl } from "./data-url";

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

function buildTargetUrl(config: ApiRequestConfig): string {
	const url = new URL(config.url);

	for (const param of config.queryParams) {
		if (param.enabled && param.key) url.searchParams.set(param.key, param.value);
	}

	if (config.auth.type === "api-key" && config.auth.location === "query" && config.auth.key) {
		url.searchParams.set(config.auth.key, config.auth.value);
	}

	return url.toString();
}

function buildHeaders(config: ApiRequestConfig): Headers {
	const headers = new Headers();

	for (const header of config.headers) {
		if (!header.enabled || !header.key.trim()) continue;
		try {
			headers.set(header.key, header.value);
		} catch {
			// The browser rejects an invalid header name/value outright — skip it rather than fail the whole request.
		}
	}

	if (config.auth.type === "bearer" && config.auth.token) {
		headers.set("Authorization", `Bearer ${config.auth.token}`);
	} else if (config.auth.type === "basic") {
		headers.set("Authorization", `Basic ${btoa(`${config.auth.username}:${config.auth.password}`)}`);
	} else if (config.auth.type === "api-key" && config.auth.location === "header" && config.auth.key) {
		headers.set(config.auth.key, config.auth.value);
	}

	return headers;
}

function buildBody(config: ApiRequestConfig): BodyInit | undefined {
	if (METHODS_WITHOUT_BODY.has(config.method)) return undefined;

	if (config.bodyType === "form-data") {
		const form = new FormData();
		for (const field of config.formData) {
			if (!field.enabled || !field.key) continue;

			if (field.type === "file") {
				const { mimeType, base64 } = parseDataUrl(field.value);
				const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
				form.append(field.key, new Blob([bytes], { type: mimeType }), field.fileName || "file");
			} else {
				form.append(field.key, field.value);
			}
		}
		return form;
	}

	if (config.bodyType === "form-urlencoded") {
		const params = new URLSearchParams();
		for (const field of config.formData) {
			if (field.enabled && field.key) params.set(field.key, field.value);
		}
		const encoded = params.toString();
		return encoded || undefined;
	}

	if (config.bodyType === "json" || config.bodyType === "raw") {
		return config.body.trim() ? config.body : undefined;
	}

	return undefined;
}

/**
 * Sends a request straight from the browser, bypassing the proxy entirely. Used only for
 * localhost/private-network targets (see local-target.ts) — a remote proxy could never reach those,
 * since they only mean anything on whichever machine actually makes the request. The browser making
 * the request directly *is* that machine, so this is the only way those targets can ever work.
 *
 * The browser still enforces CORS on the response — if the local server doesn't send
 * `Access-Control-Allow-Origin` for this site's origin, the request will fail here even though the
 * server itself is reachable and running fine.
 */
export async function sendDirectApiRequest(config: ApiRequestConfig, signal?: AbortSignal): Promise<ApiResponse> {
	let targetUrl: string;
	try {
		targetUrl = buildTargetUrl(config);
	} catch {
		return {
			success: false,
			status: 0,
			statusText: "",
			headers: {},
			body: "",
			contentType: "",
			size: 0,
			duration: 0,
			error: "Please enter a valid HTTP or HTTPS URL.",
		};
	}

	const headers = buildHeaders(config);
	const body = buildBody(config);
	if (body instanceof FormData) headers.delete("content-type");

	const startedAt = performance.now();

	try {
		const response = await fetch(targetUrl, { method: config.method, headers, body, signal });
		const text = await response.text();
		const responseHeaders: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value;
		});

		return {
			success: true,
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
			body: text,
			contentType: response.headers.get("content-type") ?? "",
			size: new TextEncoder().encode(text).length,
			duration: Math.round(performance.now() - startedAt),
		};
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") throw error;

		return {
			success: false,
			status: 0,
			statusText: "",
			headers: {},
			body: "",
			contentType: "",
			size: 0,
			duration: Math.round(performance.now() - startedAt),
			error:
				"Couldn't reach this address directly from your browser. Make sure the local server is running, and that it allows " +
				"cross-origin requests from this site (an Access-Control-Allow-Origin header) — the browser blocks the response otherwise, " +
				"even when the server itself is reachable.",
		};
	}
}
