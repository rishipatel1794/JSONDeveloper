import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadDotenv } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// For monorepo builds, populate env from app-local and repo-root files before reading process.env.
loadDotenv({ path: path.resolve(currentDir, ".env"), override: true });
loadDotenv({ path: path.resolve(currentDir, ".env.local"), override: true });
loadDotenv({ path: path.resolve(currentDir, "../../.env"), override: true });
loadDotenv({ path: path.resolve(currentDir, "../../.env.local"), override: true });

/** @type {import('next').NextConfig} */
const isProduction =
	(process.env.NEXT_PUBLIC_APP_MODE ?? process.env.NODE_ENV ?? "development").toLowerCase() === "production";

const isDevRuntime = (process.env.NEXT_PUBLIC_APP_MODE ?? "development") !== "production";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

function getOrigin(value) {
	try {
		return new URL(value).origin;
	} catch {
		return "";
	}
}

const scriptSrc = isDevRuntime
	? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
	: "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net";

const connectSrc = ["'self'", getOrigin(apiBaseUrl)].filter(Boolean).join(" ");

const contentSecurityPolicy = [
	"default-src 'self'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"form-action 'self'",
	scriptSrc,
	"style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
	"img-src 'self' data: blob:",
	"font-src 'self' data:",
	`connect-src ${connectSrc}`,
	"worker-src 'self' blob:",
].join("; ");

const nextConfig = {
	// Produces a self-contained `.next/standalone` output with just the files needed to run the
	// server — makes self-hosting (Docker, a plain VPS) much smaller to deploy. Vercel ignores this.
	output: "export",

	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "Content-Security-Policy", value: contentSecurityPolicy },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					// Every tool here is meant to be opened directly, never embedded — blocking framing
					// removes a class of clickjacking attacks for free.
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
					{ key: "Cross-Origin-Resource-Policy", value: "same-site" },
					{ key: "X-DNS-Prefetch-Control", value: "off" },
					{ key: "X-Permitted-Cross-Domain-Policies", value: "none" },
					{ key: "Origin-Agent-Cluster", value: "?1" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					// None of these tools touch the camera, microphone, or location — deny by default.
					{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
					...(isProduction
						? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }]
						: []),
				],
			},
		];
	},
};

export default nextConfig;
