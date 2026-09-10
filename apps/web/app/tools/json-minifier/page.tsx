import { Braces } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonMinifier } from "@/components/tools/json-minifier/JsonMinifier";

export const metadata = createToolMetadata({
	title: "JSON Minifier - Compress JSON",
	description: "Minify JSON by removing whitespace, indentation, and line breaks — instantly, entirely in your browser.",
	path: "/tools/json-minifier",
	keywords: ["json minifier", "json compressor", "minify json"],
});

export default function JsonMinifierPage() {
	return (
		<main>
			<ToolPageContainer wide>
				<ToolPageHeader icon={Braces} title="JSON Minifier" description="Compress JSON by removing whitespace, entirely in your browser." />

				<JsonMinifier />
			</ToolPageContainer>
		</main>
	);
}
