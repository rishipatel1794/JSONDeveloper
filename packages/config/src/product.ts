export const productConfig = {
    name: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "Developer Tools",

    shortName:
        process.env.NEXT_PUBLIC_PRODUCT_SHORT_NAME ?? "DevTools",

    description:
        process.env.NEXT_PUBLIC_PRODUCT_DESCRIPTION ??
        "Free tools for developers",

    url:
        process.env.NEXT_PUBLIC_PRODUCT_URL ??
        "http://localhost:3001",

    githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL ?? "",
} as const;