import { FileCode2 } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonCodegenFaq, getFaqItems } from "@/components/tools/json-codegen/JsonCodegenFaq";
import { JsonCodegenSeoContent } from "@/components/tools/json-codegen/JsonCodegenSeoContent";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

const TITLE = "JSON to Java - Generate Java Classes Online";
const DESCRIPTION = "Paste JSON and instantly generate Java POJO classes with private fields and getters/setters.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/json-to-java",
	keywords: ["json to java", "java class generator", "json to pojo"],
});

const jsonLd = getToolJsonLd({ name: "JSON to Java", description: DESCRIPTION, path: "/tools/json-to-java" });
const faqJsonLd = getFaqJsonLd(getFaqItems("java"));

export default function JsonToJavaPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={FileCode2} title="JSON to Java" description="Generate Java classes from JSON, entirely in your browser." />

				<JsonToCodeTool target="java" rootNameLabel="Root class name" exampleJson={CODEGEN_EXAMPLE_JSON} />
			</ToolPageContainer>

			<JsonCodegenSeoContent target="java" />
			<JsonCodegenFaq target="java" />
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "JSON to Python", href: "/tools/json-to-python", description: "Generate Python dataclasses from JSON." },
				]}
			/>
		</main>
	);
}
