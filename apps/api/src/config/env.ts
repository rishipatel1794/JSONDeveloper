function parseBoolean(value: string | undefined, fallback: boolean): boolean {
	if (value === undefined) return fallback;
	return value.toLowerCase() === "true";
}

function parseNumber(value: string | undefined, fallback: number): number {
	const parsed = Number(value);
	return value !== undefined && !Number.isNaN(parsed) ? parsed : fallback;
}

const isProduction = process.env.NODE_ENV === "production";

export const env = {
	port: parseNumber(process.env.API_PORT, 5000),

	/** Origin allowed by CORS. A client-provided origin is never trusted for this. */
	webUrl: process.env.WEB_URL ?? "http://localhost:3001",

	/**
	 * Whether the outbound proxy may target private/loopback/link-local network addresses.
	 * Defaults to enabled outside production and disabled in production — this is a server-side
	 * environment setting only; it must never be controllable by the client making the request.
	 */
	allowPrivateNetworks: parseBoolean(process.env.API_PROXY_ALLOW_PRIVATE_NETWORKS, !isProduction),

	proxyTimeoutMs: parseNumber(process.env.API_PROXY_TIMEOUT_MS, 15_000),
	maxResponseSize: parseNumber(process.env.API_PROXY_MAX_RESPONSE_SIZE, 10 * 1024 * 1024),
	// Raised from 2 MB to comfortably fit a base64-encoded multipart file upload (~5 MB raw inflates
	// to ~7 MB) alongside the rest of the JSON payload.
	maxRequestSize: parseNumber(process.env.API_PROXY_MAX_REQUEST_SIZE, 10 * 1024 * 1024),

	isProduction,
} as const;
