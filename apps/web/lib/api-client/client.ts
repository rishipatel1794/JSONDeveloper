import type { ApiRequestConfig, ApiResponse, WireApiRequest, WireFormField } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
let runtimeApiBaseUrlPromise: Promise<string> | null = null;

interface RuntimeConfig {
	NEXT_PUBLIC_API_URL?: string;
}

async function getRuntimeApiBaseUrl(): Promise<string> {
	if (typeof window === "undefined") return "";

	if (!runtimeApiBaseUrlPromise) {
		runtimeApiBaseUrlPromise = fetch("/runtime-config.json", {
			cache: "no-store",
		})
			.then(async response => {
				if (!response.ok) return "";
				const config = (await response.json()) as RuntimeConfig;
				return config.NEXT_PUBLIC_API_URL?.trim() ?? "";
			})
			.catch(() => "");
	}

	return runtimeApiBaseUrlPromise;
}

function getProxyEndpoint(baseUrl: string): string {
	const normalized = baseUrl.trim().replace(/\/+$/, "");
	if (!normalized) return "";
	return normalized.endsWith("/api/request") ? normalized : `${normalized}/api/request`;
}

/** Must stay in sync with the backend's per-file cap in apps/api/src/validators/request.validator.ts. */
export const MAX_FORM_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Splits a "data:<mime>;base64,<data>" URL into its parts, as produced by FileReader.readAsDataURL. */
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
	const match = /^data:([^;]*);base64,(.*)$/s.exec(dataUrl);
	return { mimeType: match?.[1] || "application/octet-stream", base64: match?.[2] ?? "" };
}

function toWireRequest(config: ApiRequestConfig): WireApiRequest {
	let body: string | null = null;
	let formData: WireFormField[] | undefined;

	if (config.bodyType === "json" || config.bodyType === "raw") {
		body = config.body.trim() ? config.body : null;
	} else if (config.bodyType === "form-urlencoded") {
		const params = new URLSearchParams();
		for (const field of config.formData) {
			if (field.enabled && field.key) params.set(field.key, field.value);
		}
		const encoded = params.toString();
		body = encoded || null;
	} else if (config.bodyType === "form-data") {
		formData = config.formData
			.filter(field => field.enabled && field.key)
			.map((field): WireFormField => {
				if (field.type === "file") {
					const { mimeType, base64 } = parseDataUrl(field.value);
					return { key: field.key, isFile: true, fileName: field.fileName || "file", mimeType, fileData: base64 };
				}
				return { key: field.key, isFile: false, value: field.value };
			});
	}

	return {
		method: config.method,
		url: config.url,
		queryParams: config.queryParams,
		headers: config.headers,
		body,
		formData,
		auth: config.auth,
	};
}

/**
 * The only module in the app that talks to the Express proxy. Every component that needs to send
 * a request goes through this — never call the proxy endpoint directly from a component.
 */
export async function sendApiRequest(config: ApiRequestConfig, signal?: AbortSignal): Promise<ApiResponse> {
	const runtimeApiBaseUrl = await getRuntimeApiBaseUrl();
	const resolvedApiBaseUrl = runtimeApiBaseUrl || API_BASE_URL;

	if (!resolvedApiBaseUrl) {
		return {
			success: false,
			status: 0,
			statusText: "",
			headers: {},
			body: "",
			contentType: "",
			size: 0,
			duration: 0,
			error: "API base URL is not configured. Set NEXT_PUBLIC_API_URL in runtime-config.json or env.",
		};
	}

	const proxyEndpoint = getProxyEndpoint(resolvedApiBaseUrl);

	try {
		const response = await fetch(proxyEndpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(toWireRequest(config)),
			signal,
		});

		return (await response.json()) as ApiResponse;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}

		return {
			success: false,
			status: 0,
			statusText: "",
			headers: {},
			body: "",
			contentType: "",
			size: 0,
			duration: 0,
			error: "Unable to reach the API proxy.",
		};
	}
}
