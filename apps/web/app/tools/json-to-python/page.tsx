import { FileCode2 } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

export const metadata = createToolMetadata({
	title: "JSON to Python - Generate Dataclasses",
	description: "Paste JSON and instantly generate Python dataclasses, with nested classes, List/Optional/Union types inferred automatically.",
	path: "/tools/json-to-python",
	keywords: ["json to python", "python dataclass generator", "json to dataclass"],
});

export default function JsonToPythonPage() {
	return (
		<main className="container mx-auto max-w-7xl px-4 py-10">
			<ToolPageHeader icon={FileCode2} title="JSON to Python" description="Generate Python dataclasses from JSON, entirely in your browser." />

			<JsonToCodeTool target="python" rootNameLabel="Root class name" exampleJson={CODEGEN_EXAMPLE_JSON} />
		</main>
	);
}
