import type { Metadata } from "next";

import { productConfig } from "@repo/config";

export const siteName = productConfig.name;
export const siteDescription = productConfig.description;
export const siteUrl = productConfig.url.replace(/\/$/, "");

export const defaultKeywords = [
	"developer tools",
	"online tools",
	"json formatter",
	"json validator",
	"api client",
	"curl generator",
	"jwt decoder",
	"regex tester",
	"sql formatter",
	"timestamp converter",
] as const;

function mergeKeywords(keywords: readonly string[] = []): string[] {
	return [...new Set([...defaultKeywords, ...keywords])];
}

export function absoluteUrl(path = "/"): string {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${siteUrl}${normalizedPath}`;
}

interface PageMetadataInput {
	title: string;
	description: string;
	path: string;
	keywords?: readonly string[];
}

export function createPageMetadata({
	title,
	description,
	path,
	keywords,
}: PageMetadataInput): Metadata {
	const url = absoluteUrl(path);

	return {
		title,
		description,
		alternates: {
			canonical: path,
		},
		keywords: mergeKeywords(keywords),
		openGraph: {
			title,
			description,
			url,
			siteName,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

export function createToolMetadata(input: PageMetadataInput): Metadata {
	return {
		...createPageMetadata(input),
		category: "Developer Tools",
	};
}

export function getWebsiteJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteName,
		description: siteDescription,
		url: siteUrl,
	};
}

export function getOrganizationJsonLd() {
	const sameAs = [productConfig.githubUrl].filter(Boolean);

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteName,
		url: siteUrl,
		...(sameAs.length > 0 ? { sameAs } : {}),
	};
}