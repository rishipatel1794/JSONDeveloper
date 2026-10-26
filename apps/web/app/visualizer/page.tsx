import { Waypoints } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonVisualizer } from "@/components/tools/json-visualizer/JsonVisualizer";
import { FAQ_ITEMS, JsonVisualizerFaq } from "@/components/tools/json-visualizer/JsonVisualizerFaq";
import { JsonVisualizerSeoContent } from "@/components/tools/json-visualizer/JsonVisualizerSeoContent";

const TITLE = "JSON Visualizer - Interactive Tree, Graph & Table Views";
const DESCRIPTION = "Visualize JSON as an interactive tree, a connected node graph with animated edges, or a table. Search, inspect, and export your data's structure — entirely in your browser.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/visualizer",
	keywords: [
		"json visualizer",
		"json graph",
		"json tree viewer",
		"json to graph",
		"visualize json online",
		"json node graph",
	],
});

const jsonLd = getToolJsonLd({ name: "JSON Visualizer", description: DESCRIPTION, path: "/visualizer" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function VisualizerPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={Waypoints}
					title="JSON Visualizer"
					description="See your JSON as a tree, a table, or an animated connected graph — switch views without losing your input."
				/>

				<JsonVisualizer />
			</ToolPageContainer>

			<JsonVisualizerSeoContent />
			<JsonVisualizerFaq />
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate, check, and debug JSON instantly." },
					{ name: "JSON to TypeScript", href: "/tools/json-to-typescript", description: "Generate TypeScript interfaces from JSON." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
