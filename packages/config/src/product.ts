const mode =
    (process.env.NEXT_PUBLIC_APP_MODE ?? process.env.NODE_ENV ?? "development").toLowerCase() === "production"
        ? "production"
        : "development";

export const productConfig = {
    name: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "JSONDeveloper",

    shortName:
        process.env.NEXT_PUBLIC_PRODUCT_SHORT_NAME ?? "JSONDeveloper",

    description:
        process.env.NEXT_PUBLIC_PRODUCT_DESCRIPTION ??
        "Free tools for developers",

    url:
        process.env.NEXT_PUBLIC_PRODUCT_URL ??
        "http://localhost:3001",

    githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL ?? "",

	mode,
	isProduction: mode === "production",
} as const;