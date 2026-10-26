import { FileSpreadsheet } from "lucide-react";

import { createToolMetadata, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonToCsv } from "@/components/tools/json-to-csv/JsonToCsv";

const TITLE = "JSON to CSV Converter Online";
const DESCRIPTION = "Convert a JSON array of objects into CSV. Flattens nested objects, escapes special characters, and runs entirely in your browser.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/json-to-csv",
	keywords: ["json to csv", "convert json to csv online", "json array to csv", "json csv converter"],
});

const jsonLd = getToolJsonLd({ name: "JSON to CSV Converter", description: DESCRIPTION, path: "/tools/json-to-csv" });

export default function JsonToCsvPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={FileSpreadsheet} title="JSON to CSV" description="Convert a JSON array of objects into a downloadable CSV file." />
				<JsonToCsv />
			</ToolPageContainer>

			<RelatedTools
				tools={[
					{ name: "JSON Visualizer", href: "/visualizer", description: "Visualize JSON as a tree, table, or graph." },
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate, check, and debug JSON instantly." },
					{ name: "SQL Formatter", href: "/sql-formatter", description: "Format and beautify SQL queries." },
				]}
			/>
		</main>
	);
}
