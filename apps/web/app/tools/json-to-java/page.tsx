import { FileCode2 } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

export const metadata = createToolMetadata({
	title: "JSON to Java - Generate Java Classes",
	description: "Paste JSON and instantly generate Java POJO classes with private fields and getters/setters.",
	path: "/tools/json-to-java",
	keywords: ["json to java", "java class generator", "json to pojo"],
});

export default function JsonToJavaPage() {
	return (
		<main className="container mx-auto max-w-7xl px-4 py-10">
			<ToolPageHeader icon={FileCode2} title="JSON to Java" description="Generate Java classes from JSON, entirely in your browser." />

			<JsonToCodeTool target="java" rootNameLabel="Root class name" exampleJson={CODEGEN_EXAMPLE_JSON} />
		</main>
	);
}
