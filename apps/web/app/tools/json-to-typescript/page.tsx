import { FileCode2 } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonCodegenFaq, getFaqItems } from "@/components/tools/json-codegen/JsonCodegenFaq";
import { JsonCodegenSeoContent } from "@/components/tools/json-codegen/JsonCodegenSeoContent";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

const TITLE = "JSON to TypeScript - Generate Interfaces Online";
const DESCRIPTION = "Paste JSON and instantly generate TypeScript interfaces, with nested types and optional fields inferred automatically.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/json-to-typescript",
	keywords: ["json to typescript", "json to interface", "typescript interface generator"],
});

const jsonLd = getToolJsonLd({ name: "JSON to TypeScript", description: DESCRIPTION, path: "/tools/json-to-typescript" });
const faqJsonLd = getFaqJsonLd(getFaqItems("typescript"));

export default function JsonToTypeScriptPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={FileCode2} title="JSON to TypeScript" description="Generate TypeScript interfaces from JSON, entirely in your browser." />

				<JsonToCodeTool target="typescript" rootNameLabel="Root interface name" exampleJson={CODEGEN_EXAMPLE_JSON} />
			</ToolPageContainer>

			<JsonCodegenSeoContent target="typescript" />
			<JsonCodegenFaq target="typescript" />
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "JSON to Zod", href: "/tools/json-to-zod", description: "Generate a Zod schema from JSON." },
				]}
			/>
		</main>
	);
}
