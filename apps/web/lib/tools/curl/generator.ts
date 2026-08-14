import type { CurlRequest, Shell } from "./types";
import { buildRequestUrl, escapeBashArg, escapePowerShellArg } from "./utils";

interface CommandPart {
	flag: string;
	value?: string;
	/** Skip shell escaping — only for values from a fixed, non-free-text vocabulary (e.g. HTTP method). */
	raw?: boolean;
}

export function generateCurl(request: CurlRequest, shell: Shell): string {
	const escape = shell === "powershell" ? escapePowerShellArg : escapeBashArg;
	const curlBinary = shell === "powershell" ? "curl.exe" : "curl";
	const continuation = shell === "powershell" ? "`" : "\\";

	const parts: CommandPart[] = [];

	parts.push({ flag: "--request", value: request.method, raw: true });

	const extraQueryParam =
		request.auth.type === "api-key" && request.auth.location === "query"
			? { key: request.auth.key, value: request.auth.value }
			: undefined;

	parts.push({ flag: "--url", value: buildRequestUrl(request.url, request.queryParams, extraQueryParam) });

	const headerLines: string[] = [];
	for (const header of request.headers) {
		if (header.enabled && header.key) headerLines.push(`${header.key}: ${header.value}`);
	}
	if (request.auth.type === "bearer" && request.auth.token) {
		headerLines.push(`Authorization: Bearer ${request.auth.token}`);
	}
	if (request.auth.type === "api-key" && request.auth.location === "header" && request.auth.key) {
		headerLines.push(`${request.auth.key}: ${request.auth.value}`);
	}
	for (const line of headerLines) {
		parts.push({ flag: "--header", value: line });
	}

	if (request.bodyType === "json" || request.bodyType === "raw") {
		if (request.body.trim()) {
			parts.push({ flag: "--data", value: request.body });
		}
	} else if (request.bodyType === "form-urlencoded") {
		for (const field of request.formData) {
			if (field.enabled && field.key) {
				parts.push({ flag: "--data-urlencode", value: `${field.key}=${field.value}` });
			}
		}
	} else if (request.bodyType === "multipart") {
		for (const field of request.formData) {
			if (field.enabled && field.key) {
				const value = field.type === "file" ? `@${field.value}` : field.value;
				parts.push({ flag: "--form", value: `${field.key}=${value}` });
			}
		}
	}

	if (request.auth.type === "basic" && request.auth.username) {
		parts.push({ flag: "--user", value: `${request.auth.username}:${request.auth.password}` });
	}

	if (request.cookies.trim()) {
		parts.push({ flag: "--cookie", value: request.cookies });
	}

	if (request.userAgent.trim()) {
		parts.push({ flag: "--user-agent", value: request.userAgent });
	}

	if (request.compressed) parts.push({ flag: "--compressed" });
	if (request.followRedirects) parts.push({ flag: "--location" });
	if (request.insecure) parts.push({ flag: "--insecure" });

	const lines = parts.map(part => {
		if (part.value === undefined) return part.flag;
		return part.raw ? `${part.flag} ${part.value}` : `${part.flag} ${escape(part.value)}`;
	});

	return [curlBinary, ...lines].join(` ${continuation}\n  `);
}
