import { FileCode2 } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonCodegenFaq, getFaqItems } from "@/components/tools/json-codegen/JsonCodegenFaq";
import { JsonCodegenSeoContent } from "@/components/tools/json-codegen/JsonCodegenSeoContent";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

const TITLE = "JSON to Python - Generate Dataclasses Online";
const DESCRIPTION = "Paste JSON and instantly generate Python dataclasses, with nested classes, List/Optional/Union types inferred automatically.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/json-to-python",
	keywords: ["json to python", "python dataclass generator", "json to dataclass"],
});

const jsonLd = getToolJsonLd({ name: "JSON to Python", description: DESCRIPTION, path: "/tools/json-to-python" });
const faqJsonLd = getFaqJsonLd(getFaqItems("python"));

export default function JsonToPythonPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={FileCode2} title="JSON to Python" description="Generate Python dataclasses from JSON, entirely in your browser." />

				<JsonToCodeTool target="python" rootNameLabel="Root class name" exampleJson={CODEGEN_EXAMPLE_JSON} />
			</ToolPageContainer>

			<JsonCodegenSeoContent target="python" />
			<JsonCodegenFaq target="python" />
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "JSON to Java", href: "/tools/json-to-java", description: "Generate Java classes from JSON." },
				]}
			/>
		</main>
	);
}
