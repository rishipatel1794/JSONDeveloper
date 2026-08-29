const mode =
    (process.env.NEXT_PUBLIC_APP_MODE ?? process.env.NODE_ENV ?? "development").toLowerCase() === "production"
        ? "production"
        : "development";

function resolvePublicUrl(rawUrl: string | undefined): string {
    const fallback = "https://jsondeveloper.rishipatel1794.workers.dev";
    const candidate = rawUrl?.trim() || (mode === "production" ? fallback : "http://localhost:3001");

    try {
        const parsed = new URL(candidate);
        const hostname = parsed.hostname.toLowerCase();
        const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

        if (mode === "production" && isLocalHost) {
            return fallback;
        }

        return parsed.toString().replace(/\/$/, "");
    } catch {
        return fallback;
    }
}

export const productConfig = {
    name: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "JSONDeveloper",

    shortName:
        process.env.NEXT_PUBLIC_PRODUCT_SHORT_NAME ?? "JSONDeveloper",

    description:
        process.env.NEXT_PUBLIC_PRODUCT_DESCRIPTION ??
        "Free tools for developers",

    url: resolvePublicUrl(process.env.NEXT_PUBLIC_PRODUCT_URL),

    githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL ?? "",

	mode,
	isProduction: mode === "production",
} as const;