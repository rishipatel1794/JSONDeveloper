import { Terminal } from "lucide-react";

import { createToolMetadata, getToolJsonLd } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { CronParser } from "@/components/tools/cron-parser/CronParser";
import { CronParserFaq } from "@/components/tools/cron-parser/CronParserFaq";
import { CronParserSeoContent } from "@/components/tools/cron-parser/CronParserSeoContent";

const TITLE = "Cron Parser - Explain Cron Expressions Online";
const DESCRIPTION = "Parse and explain cron expressions online. Understand every cron field and see what your schedule means.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/cron-parser",
	keywords: ["cron parser", "explain cron expression", "cron expression meaning", "crontab explainer"],
});

const jsonLd = getToolJsonLd({ name: "Cron Parser", description: DESCRIPTION, path: "/tools/cron-parser" });

export default function CronParserPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Terminal}
					title="Cron Parser"
					description="Paste a cron expression and get a plain-English explanation, a field-by-field breakdown, and upcoming run times."
				/>

				<CronParser />
			</div>

			<CronParserSeoContent />
			<CronParserFaq />
			<RelatedTools
				tools={[
					{ name: "Cron Generator", href: "/tools/cron-generator", description: "Visually build a cron expression from a schedule." },
					{ name: "Timestamp Converter", href: "/timestamp-converter", description: "Convert and inspect Unix timestamps and dates." },
					{ name: "Docker Compose Generator", href: "/tools/docker-compose-generator", description: "Generate docker-compose.yml files visually." },
					{ name: "Regex Tester", href: "/regex-tester", description: "Test and debug regular expressions instantly." },
				]}
			/>
		</main>
	);
}
