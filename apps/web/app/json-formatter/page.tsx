import type { Metadata } from "next";
import { FileJson2 } from "lucide-react";

import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

import { JsonFormatter } from "../../components/tools/json-formatter/JsonFormatter";

export const metadata: Metadata = {
	title: "JSON Formatter",
	description: "Format, validate, minify, and download JSON directly in your browser.",
};

export default function JsonFormatterPage() {
	return (
		<main className="container mx-auto max-w-7xl px-4 py-10">
			<ToolPageHeader
				icon={FileJson2}
				title="JSON Formatter"
				description="Format, validate, minify, and download JSON directly in your browser."
			/>

			<JsonFormatter />
		</main>
	);
}
