import type { MetadataRoute } from "next";

import { productConfig } from "@repo/config";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: productConfig.name,
		short_name: productConfig.shortName,
		description: productConfig.description,
		start_url: "/",
		display: "standalone",
		background_color: "#0b1220",
		theme_color: "#2563eb",
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
		],
	};
}