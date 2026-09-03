import { FileCode2 } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

export const metadata = createToolMetadata({
	title: "JSON to TypeScript - Generate Interfaces",
	description: "Paste JSON and instantly generate TypeScript interfaces, with nested types and optional fields inferred automatically.",
	path: "/tools/json-to-typescript",
	keywords: ["json to typescript", "json to interface", "typescript interface generator"],
});

export default function JsonToTypeScriptPage() {
	return (
		<main className="container mx-auto max-w-7xl px-4 py-10">
			<ToolPageHeader icon={FileCode2} title="JSON to TypeScript" description="Generate TypeScript interfaces from JSON, entirely in your browser." />

			<JsonToCodeTool target="typescript" rootNameLabel="Root interface name" exampleJson={CODEGEN_EXAMPLE_JSON} />
		</main>
	);
}
