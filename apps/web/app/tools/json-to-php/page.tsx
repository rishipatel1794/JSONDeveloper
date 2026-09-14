import { FileCode2 } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonCodegenFaq, getFaqItems } from "@/components/tools/json-codegen/JsonCodegenFaq";
import { JsonCodegenSeoContent } from "@/components/tools/json-codegen/JsonCodegenSeoContent";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

const TITLE = "JSON to PHP - Generate PHP Classes Online";
const DESCRIPTION = "Paste JSON and instantly generate PHP 8 classes with constructor property promotion and PHPDoc array types.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/json-to-php",
	keywords: ["json to php", "php class generator", "json to php class"],
});

const jsonLd = getToolJsonLd({ name: "JSON to PHP", description: DESCRIPTION, path: "/tools/json-to-php" });
const faqJsonLd = getFaqJsonLd(getFaqItems("php"));

export default function JsonToPhpPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={FileCode2} title="JSON to PHP" description="Generate PHP classes from JSON, entirely in your browser." />

				<JsonToCodeTool target="php" rootNameLabel="Root class name" exampleJson={CODEGEN_EXAMPLE_JSON} />
			</ToolPageContainer>

			<JsonCodegenSeoContent target="php" />
			<JsonCodegenFaq target="php" />
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
