import type { MetadataRoute } from "next";

import { productConfig } from "@repo/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = productConfig.url.replace(/\/$/, "");

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
			},
			{
				userAgent: "Googlebot",
				allow: "/",
				crawlDelay: 1,
			},
		],
		host: baseUrl,
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
