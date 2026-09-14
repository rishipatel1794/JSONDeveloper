import { FileJson2 } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

import { FAQ_ITEMS, JsonFormatterFaq } from "../../components/tools/json-formatter/JsonFormatterFaq";
import { JsonFormatter } from "../../components/tools/json-formatter/JsonFormatter";
import { JsonFormatterSeoContent } from "../../components/tools/json-formatter/JsonFormatterSeoContent";

const TITLE = "JSON Formatter - Format, Validate & Beautify JSON Online";
const DESCRIPTION =
	"Format, validate, minify, and download JSON online. Paste JSON and instantly get readable, indented output — free, fast, and entirely in your browser.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/json-formatter",
	keywords: ["json formatter", "json pretty print", "json beautifier", "format json online"],
});

const jsonLd = getToolJsonLd({ name: "JSON Formatter", description: DESCRIPTION, path: "/json-formatter" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function JsonFormatterPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={FileJson2}
					title="JSON Formatter"
					description="Format, validate, minify, and download JSON directly in your browser."
				/>

				<JsonFormatter />
			</ToolPageContainer>

			<JsonFormatterSeoContent />
			<JsonFormatterFaq />
			<RelatedTools
				tools={[
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "JSON Minifier", href: "/tools/json-minifier", description: "Compress JSON by removing whitespace." },
					{ name: "JSON to TypeScript", href: "/tools/json-to-typescript", description: "Generate TypeScript interfaces from JSON." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
