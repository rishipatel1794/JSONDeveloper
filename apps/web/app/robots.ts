import type { MetadataRoute } from "next";

import { productConfig } from "@repo/config";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = productConfig.url.replace(/\/$/, "");

	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
