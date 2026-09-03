import { FileCode2 } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

export const metadata = createToolMetadata({
	title: "JSON to PHP - Generate PHP Classes",
	description: "Paste JSON and instantly generate PHP 8 classes with constructor property promotion and PHPDoc array types.",
	path: "/tools/json-to-php",
	keywords: ["json to php", "php class generator", "json to php class"],
});

export default function JsonToPhpPage() {
	return (
		<main className="container mx-auto max-w-7xl px-4 py-10">
			<ToolPageHeader icon={FileCode2} title="JSON to PHP" description="Generate PHP classes from JSON, entirely in your browser." />

			<JsonToCodeTool target="php" rootNameLabel="Root class name" exampleJson={CODEGEN_EXAMPLE_JSON} />
		</main>
	);
}
