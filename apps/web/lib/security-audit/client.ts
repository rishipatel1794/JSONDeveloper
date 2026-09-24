import type { AuditResult } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
let runtimeApiBaseUrlPromise: Promise<string> | null = null;

interface RuntimeConfig {
	NEXT_PUBLIC_API_URL?: string;
}

/** Same runtime-config-aware base URL resolution as lib/api-client/client.ts, so both features stay
 * consistent if the backend URL is ever changed post-build via runtime-config.json. */
async function getRuntimeApiBaseUrl(): Promise<string> {
	if (typeof window === "undefined") return "";

	if (!runtimeApiBaseUrlPromise) {
		runtimeApiBaseUrlPromise = fetch("/runtime-config.json", { cache: "no-store" })
			.then(async response => {
				if (!response.ok) return "";
				const config = (await response.json()) as RuntimeConfig;
				return config.NEXT_PUBLIC_API_URL?.trim() ?? "";
			})
			.catch(() => "");
	}

	return runtimeApiBaseUrlPromise;
}

function getSecurityAuditEndpoint(baseUrl: string): string {
	const normalized = baseUrl.trim().replace(/\/+$/, "");
	if (!normalized) return "";
	return normalized.endsWith("/api/security-audit") ? normalized : `${normalized}/api/security-audit`;
}

export async function runSecurityAudit(url: string, signal?: AbortSignal): Promise<AuditResult> {
	const runtimeApiBaseUrl = await getRuntimeApiBaseUrl();
	const resolvedApiBaseUrl = runtimeApiBaseUrl || API_BASE_URL;

	if (!resolvedApiBaseUrl) {
		return { error: "API base URL is not configured. Set NEXT_PUBLIC_API_URL in runtime-config.json or env." };
	}

	const endpoint = getSecurityAuditEndpoint(resolvedApiBaseUrl);

	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url }),
			signal,
		});

		const body = (await response.json()) as AuditResult;

		if (response.status === 429 && "error" in body) {
			return body;
		}

		return body;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}

		return { error: "Unable to reach the security audit service." };
	}
}
