import { env } from "../config/env";
import { buildOutboundHeaders } from "../utils/headers";
import { filterResponseHeaders, readBodyWithLimit } from "../utils/response";
import { validateOutboundUrl } from "../utils/ssrf";
import type { ApiRequestInput } from "../validators/request.validator";

export interface ProxyResponse {
	success: boolean;
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: string;
	contentType: string;
	size: number;
	duration: number;
	error?: string;
}

export interface ProxyResult {
	httpStatus: number;
	body: ProxyResponse;
}

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

/**
 * Builds the outbound fetch body. For "form-data" requests this constructs a real multipart body via
 * Node's native FormData/Blob — letting fetch generate the boundary itself — rather than trying to
 * hand-assemble multipart bytes here. File content arrives base64-encoded (JSON can't carry binary).
 */
function buildOutboundBody(input: ApiRequestInput): string | FormData | undefined {
	if (METHODS_WITHOUT_BODY.has(input.method)) return undefined;

	if (input.formData && input.formData.length > 0) {
		const form = new FormData();
		for (const field of input.formData) {
			if (field.isFile) {
				form.append(field.key, new Blob([Buffer.from(field.fileData, "base64")], { type: field.mimeType || "application/octet-stream" }), field.fileName);
			} else {
				form.append(field.key, field.value);
			}
		}
		return form;
	}

	return input.body !== null && input.body !== "" ? input.body : undefined;
}

function buildTargetUrl(input: ApiRequestInput): string {
	const url = new URL(input.url);

	for (const param of input.queryParams) {
		if (param.enabled && param.key) {
			url.searchParams.set(param.key, param.value);
		}
	}

	if (input.auth.type === "api-key" && input.auth.location === "query" && input.auth.key) {
		url.searchParams.set(input.auth.key, input.auth.value);
	}

	return url.toString();
}

function buildOutboundRequestHeaders(input: ApiRequestInput): Headers {
	const headers = buildOutboundHeaders(input.headers);

	if (input.auth.type === "bearer" && input.auth.token) {
		headers.set("Authorization", `Bearer ${input.auth.token}`);
	} else if (input.auth.type === "basic") {
		const encoded = Buffer.from(`${input.auth.username}:${input.auth.password}`).toString("base64");
		headers.set("Authorization", `Basic ${encoded}`);
	} else if (input.auth.type === "api-key" && input.auth.location === "header" && input.auth.key) {
		headers.set(input.auth.key, input.auth.value);
	}

	return headers;
}

function emptyErrorResponse(error: string, duration = 0): ProxyResult {
	return {
		httpStatus: 400,
		body: {
			success: false,
			status: 0,
			statusText: "",
			headers: {},
			body: "",
			contentType: "",
			size: 0,
			duration,
			error,
		},
	};
}

export async function executeProxyRequest(input: ApiRequestInput): Promise<ProxyResult> {
	const ssrfCheck = await validateOutboundUrl(input.url, env.allowPrivateNetworks);
	if (!ssrfCheck.allowed) {
		return emptyErrorResponse(ssrfCheck.reason ?? "This request target is not allowed.");
	}

	let targetUrl: string;
	try {
		targetUrl = buildTargetUrl(input);
	} catch {
		return emptyErrorResponse("Please enter a valid HTTP or HTTPS URL.");
	}

	const headers = buildOutboundRequestHeaders(input);
	const body = buildOutboundBody(input);

	// A multipart body's boundary is only known once FormData serializes it — fetch sets the correct
	// Content-Type itself, but only if one isn't already present, so any user-supplied value (left
	// over from a previous body type, or never valid for multipart in the first place) must go.
	if (body instanceof FormData) headers.delete("content-type");

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), env.proxyTimeoutMs);
	const startedAt = Date.now();

	try {
		const response = await fetch(targetUrl, {
			method: input.method,
			headers,
			body,
			// Never auto-follow redirects — this removes the largest SSRF surface (a redirect to an
			// internal address after the initial URL already passed validation). The redirect itself
			// is surfaced to the user as a normal 3xx response instead.
			redirect: "manual",
			signal: controller.signal,
		});

		const { buffer, truncated } = await readBodyWithLimit(response, env.maxResponseSize);
		const duration = Date.now() - startedAt;

		if (truncated) {
			return {
				httpStatus: 200,
				body: {
					success: false,
					status: response.status,
					statusText: response.statusText,
					headers: filterResponseHeaders(response.headers),
					body: "",
					contentType: response.headers.get("content-type") ?? "",
					size: buffer.byteLength,
					duration,
					error: "Response exceeded the maximum allowed size.",
				},
			};
		}

		return {
			httpStatus: 200,
			body: {
				success: true,
				status: response.status,
				statusText: response.statusText,
				headers: filterResponseHeaders(response.headers),
				body: buffer.toString("utf-8"),
				contentType: response.headers.get("content-type") ?? "",
				size: buffer.byteLength,
				duration,
			},
		};
	} catch (error) {
		const duration = Date.now() - startedAt;
		const isAbort = error instanceof Error && error.name === "AbortError";

		return {
			httpStatus: 200,
			body: {
				success: false,
				status: 0,
				statusText: "",
				headers: {},
				body: "",
				contentType: "",
				size: 0,
				duration,
				error: isAbort ? "The request timed out." : "Unable to reach the target server.",
			},
		};
	} finally {
		clearTimeout(timeoutId);
	}
}
