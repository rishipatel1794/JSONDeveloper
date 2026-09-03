import type { MetadataRoute } from "next";

import { productConfig } from "@repo/config";

import { tools } from "@/lib/tools/registry";
import { BLOG_POSTS } from "@/lib/content/blog";
import { DEVELOPER_GUIDES } from "@/lib/content/guides";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = productConfig.url.replace(/\/$/, "");
	const lastModified = new Date();

	const toolEntries: MetadataRoute.Sitemap = tools
		.filter(tool => tool.available)
		.map(tool => ({
			url: `${baseUrl}${tool.href}`,
			lastModified,
			changeFrequency: "weekly",
			priority: tool.popular ? 0.8 : 0.6,
		}));

	const staticEntries: MetadataRoute.Sitemap = ["/about", "/contact", "/privacy", "/terms", "/blog", "/developer-guides"].map(path => ({
		url: `${baseUrl}${path}`,
		lastModified,
		changeFrequency: "yearly",
		priority: 0.3,
	}));

	const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: new Date(post.publishedAt),
		changeFrequency: "monthly",
		priority: 0.5,
	}));

	const guideEntries: MetadataRoute.Sitemap = DEVELOPER_GUIDES.map(guide => ({
		url: `${baseUrl}/developer-guides/${guide.slug}`,
		lastModified: new Date(guide.updatedAt),
		changeFrequency: "monthly",
		priority: 0.5,
	}));

	return [
		{ url: baseUrl, lastModified, changeFrequency: "daily", priority: 1 },
		...toolEntries,
		...staticEntries,
		...blogEntries,
		...guideEntries,
	];
}
