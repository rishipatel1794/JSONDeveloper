import { Container } from "lucide-react";

import { createToolMetadata, getToolJsonLd } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { HtaccessGenerator } from "@/components/tools/htaccess-generator/HtaccessGenerator";
import { HtaccessGeneratorFaq } from "@/components/tools/htaccess-generator/HtaccessGeneratorFaq";
import { HtaccessGeneratorSeoContent } from "@/components/tools/htaccess-generator/HtaccessGeneratorSeoContent";

const TITLE = ".htaccess Generator - Generate Apache Configuration Online";
const DESCRIPTION = "Generate .htaccess files and Apache rewrite rules online for redirects, HTTPS, caching, security headers, and more.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/htaccess-generator",
	keywords: [".htaccess generator", "apache config generator", "htaccess redirect generator", "mod_rewrite generator"],
});

const jsonLd = getToolJsonLd({ name: ".htaccess Generator", description: DESCRIPTION, path: "/tools/htaccess-generator" });

export default function HtaccessGeneratorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Container}
					title=".htaccess Generator"
					description="Generate a conservative, valid .htaccess file for HTTPS, redirects, caching, compression, and security headers."
				/>

				<HtaccessGenerator />
			</div>

			<HtaccessGeneratorSeoContent />
			<HtaccessGeneratorFaq />
			<RelatedTools
				tools={[
					{ name: "Nginx Config Generator", href: "/tools/nginx-config-generator", description: "Generate Nginx server block configurations." },
					{ name: "Docker Compose Generator", href: "/tools/docker-compose-generator", description: "Generate docker-compose.yml files visually." },
					{ name: "cURL Generator", href: "/curl-generator", description: "Build and generate cURL commands for HTTP requests." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
