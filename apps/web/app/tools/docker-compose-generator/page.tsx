import { Container } from "lucide-react";

import { createToolMetadata, getToolJsonLd } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { DockerComposeGenerator } from "@/components/tools/docker-compose-generator/DockerComposeGenerator";
import { DockerComposeGeneratorFaq } from "@/components/tools/docker-compose-generator/DockerComposeGeneratorFaq";
import { DockerComposeGeneratorSeoContent } from "@/components/tools/docker-compose-generator/DockerComposeGeneratorSeoContent";

const TITLE = "Docker Compose Generator - Create docker-compose.yml Online";
const DESCRIPTION = "Generate Docker Compose YAML files online for Node.js, PostgreSQL, Redis, MongoDB, Nginx, and custom services.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/docker-compose-generator",
	keywords: ["docker compose generator", "docker-compose.yml generator", "docker compose builder", "compose file generator"],
});

const jsonLd = getToolJsonLd({ name: "Docker Compose Generator", description: DESCRIPTION, path: "/tools/docker-compose-generator" });

export default function DockerComposeGeneratorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Container}
					title="Docker Compose Generator"
					description="Visually build a docker-compose.yml with multiple services, sensible database presets, and safe placeholder secrets."
				/>

				<DockerComposeGenerator />
			</div>

			<DockerComposeGeneratorSeoContent />
			<DockerComposeGeneratorFaq />
			<RelatedTools
				tools={[
					{ name: "Nginx Config Generator", href: "/tools/nginx-config-generator", description: "Generate Nginx server block configurations." },
					{ name: ".htaccess Generator", href: "/tools/htaccess-generator", description: "Generate Apache .htaccess configuration." },
					{ name: "Cron Generator", href: "/tools/cron-generator", description: "Visually build a cron expression from a schedule." },
					{ name: "JSON to Java", href: "/tools/json-to-java", description: "Generate Java classes from JSON." },
				]}
			/>
		</main>
	);
}
