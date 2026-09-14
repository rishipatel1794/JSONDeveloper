import { Braces } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { FAQ_ITEMS, JsonMinifierFaq } from "@/components/tools/json-minifier/JsonMinifierFaq";
import { JsonMinifier } from "@/components/tools/json-minifier/JsonMinifier";
import { JsonMinifierSeoContent } from "@/components/tools/json-minifier/JsonMinifierSeoContent";

const TITLE = "JSON Minifier - Compress JSON Online";
const DESCRIPTION = "Minify JSON by removing whitespace, indentation, and line breaks — instantly, entirely in your browser. Free JSON compressor with no upload.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/json-minifier",
	keywords: ["json minifier", "json compressor", "minify json", "compress json online"],
});

const jsonLd = getToolJsonLd({ name: "JSON Minifier", description: DESCRIPTION, path: "/tools/json-minifier" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function JsonMinifierPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={Braces} title="JSON Minifier" description="Compress JSON by removing whitespace, entirely in your browser." />

				<JsonMinifier />
			</ToolPageContainer>

			<JsonMinifierSeoContent />
			<JsonMinifierFaq />
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "JSON to TypeScript", href: "/tools/json-to-typescript", description: "Generate TypeScript interfaces from JSON." },
				]}
			/>
		</main>
	);
}
