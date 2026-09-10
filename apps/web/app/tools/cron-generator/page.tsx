import { Terminal } from "lucide-react";

import { createToolMetadata, getToolJsonLd } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { CronGenerator } from "@/components/tools/cron-generator/CronGenerator";
import { CronGeneratorFaq } from "@/components/tools/cron-generator/CronGeneratorFaq";
import { CronGeneratorSeoContent } from "@/components/tools/cron-generator/CronGeneratorSeoContent";

const TITLE = "Cron Generator - Create Cron Expressions Online";
const DESCRIPTION = "Create cron expressions online with an easy visual cron generator. Build schedules and understand cron syntax instantly.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/cron-generator",
	keywords: ["cron generator", "cron expression generator", "crontab generator", "cron schedule builder"],
});

const jsonLd = getToolJsonLd({ name: "Cron Generator", description: DESCRIPTION, path: "/tools/cron-generator" });

export default function CronGeneratorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Terminal}
					title="Cron Generator"
					description="Visually build a cron expression from a schedule, with presets, live validation, and a plain-English explanation."
				/>

				<CronGenerator />
			</div>

			<CronGeneratorSeoContent />
			<CronGeneratorFaq />
			<RelatedTools
				tools={[
					{ name: "Cron Parser", href: "/tools/cron-parser", description: "Paste a cron expression and see exactly what it does." },
					{ name: "Timestamp Converter", href: "/timestamp-converter", description: "Convert and inspect Unix timestamps and dates." },
					{ name: "Docker Compose Generator", href: "/tools/docker-compose-generator", description: "Generate docker-compose.yml files visually." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
