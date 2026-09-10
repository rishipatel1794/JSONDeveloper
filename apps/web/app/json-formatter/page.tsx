import { FileJson2 } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

import { JsonFormatter } from "../../components/tools/json-formatter/JsonFormatter";

export const metadata = createToolMetadata({
	title: "JSON Formatter",
	description: "Format, validate, minify, and download JSON directly in your browser.",
	path: "/json-formatter",
	keywords: ["json pretty print", "json beautifier", "json minifier"],
});

export default function JsonFormatterPage() {
	return (
		<main>
			<ToolPageContainer wide>
				<ToolPageHeader
					icon={FileJson2}
					title="JSON Formatter"
					description="Format, validate, minify, and download JSON directly in your browser."
				/>

				<JsonFormatter />
			</ToolPageContainer>
		</main>
	);
}
