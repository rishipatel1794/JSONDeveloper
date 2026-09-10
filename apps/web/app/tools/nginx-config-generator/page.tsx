import { Container } from "lucide-react";

import { createToolMetadata, getToolJsonLd } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { NginxConfigGenerator } from "@/components/tools/nginx-config-generator/NginxConfigGenerator";
import { NginxConfigGeneratorFaq } from "@/components/tools/nginx-config-generator/NginxConfigGeneratorFaq";
import { NginxConfigGeneratorSeoContent } from "@/components/tools/nginx-config-generator/NginxConfigGeneratorSeoContent";

const TITLE = "Nginx Config Generator - Create Nginx Server Configs";
const DESCRIPTION = "Generate Nginx server block configurations online for reverse proxy, HTTPS, static websites, caching, and more.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/nginx-config-generator",
	keywords: ["nginx config generator", "nginx reverse proxy config", "nginx server block generator", "nginx ssl config"],
});

const jsonLd = getToolJsonLd({ name: "Nginx Config Generator", description: DESCRIPTION, path: "/tools/nginx-config-generator" });

export default function NginxConfigGeneratorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Container}
					title="Nginx Config Generator"
					description="Generate a valid Nginx server block for a reverse proxy or static site, with HTTPS, caching, and security headers."
				/>

				<NginxConfigGenerator />
			</div>

			<NginxConfigGeneratorSeoContent />
			<NginxConfigGeneratorFaq />
			<RelatedTools
				tools={[
					{ name: ".htaccess Generator", href: "/tools/htaccess-generator", description: "Generate Apache .htaccess configuration." },
					{ name: "Docker Compose Generator", href: "/tools/docker-compose-generator", description: "Generate docker-compose.yml files visually." },
					{ name: "cURL Generator", href: "/curl-generator", description: "Build and generate cURL commands for HTTP requests." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
