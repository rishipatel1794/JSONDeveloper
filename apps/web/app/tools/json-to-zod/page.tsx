import { FileCode2 } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonToCodeTool } from "@/components/tools/json-codegen/JsonToCodeTool";
import { CODEGEN_EXAMPLE_JSON } from "@/lib/tools/json-codegen/example";

export const metadata = createToolMetadata({
	title: "JSON to Zod - Generate Zod Schemas",
	description: "Paste JSON and instantly generate a Zod schema, with nested objects, arrays, and optional fields inferred automatically.",
	path: "/tools/json-to-zod",
	keywords: ["json to zod", "zod schema generator", "zod from json"],
});

export default function JsonToZodPage() {
	return (
		<main className="container mx-auto max-w-7xl px-4 py-10">
			<ToolPageHeader icon={FileCode2} title="JSON to Zod" description="Generate a Zod schema from JSON, entirely in your browser." />

			<JsonToCodeTool target="zod" rootNameLabel="Root schema name" exampleJson={CODEGEN_EXAMPLE_JSON} />
		</main>
	);
}
