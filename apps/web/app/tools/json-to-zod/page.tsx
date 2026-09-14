import { FileCode2 } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonCodegenFaq, getFaqItems } from "@/components/tools/json-codegen/JsonCodegenFaq";
import { JsonCodegenSeoContent } from "@/components/tools/json-codegen/JsonCodegenSeoContent";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

const TITLE = "JSON to Zod - Generate Zod Schemas Online";
const DESCRIPTION = "Paste JSON and instantly generate a Zod schema, with nested objects, arrays, and optional fields inferred automatically.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/json-to-zod",
	keywords: ["json to zod", "zod schema generator", "zod from json"],
});

const jsonLd = getToolJsonLd({ name: "JSON to Zod", description: DESCRIPTION, path: "/tools/json-to-zod" });
const faqJsonLd = getFaqJsonLd(getFaqItems("zod"));

export default function JsonToZodPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={FileCode2} title="JSON to Zod" description="Generate a Zod schema from JSON, entirely in your browser." />

				<JsonToCodeTool target="zod" rootNameLabel="Root schema name" exampleJson={CODEGEN_EXAMPLE_JSON} />
			</ToolPageContainer>

			<JsonCodegenSeoContent target="zod" />
			<JsonCodegenFaq target="zod" />
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
