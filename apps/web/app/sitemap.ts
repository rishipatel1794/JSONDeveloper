import type { MetadataRoute } from "next";

import { productConfig } from "@repo/config";

import { tools } from "@/lib/tools/registry";

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

	return [{ url: baseUrl, lastModified, changeFrequency: "daily", priority: 1 }, ...toolEntries];
}
