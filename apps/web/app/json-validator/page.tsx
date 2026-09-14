import { ShieldCheck } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonValidator } from "@/components/tools/json-validator/JsonValidator";
import { FAQ_ITEMS, JsonValidatorFaq } from "@/components/tools/json-validator/JsonValidatorFaq";
import { JsonValidatorSeoContent } from "@/components/tools/json-validator/JsonValidatorSeoContent";

const TITLE = "JSON Validator & Analyzer";
const DESCRIPTION = "Validate JSON, find syntax errors, detect duplicate keys, analyze JSON structure and validate JSON against JSON Schema.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/json-validator",
	keywords: ["json validator", "json schema validator", "json lint"],
});

const jsonLd = getToolJsonLd({ name: "JSON Validator", description: DESCRIPTION, path: "/json-validator" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function JsonValidatorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={ShieldCheck}
					title="JSON Validator"
					description="Validate, debug, and analyze JSON instantly."
				/>

				<JsonValidator />
			</ToolPageContainer>

			<JsonValidatorSeoContent />
			<JsonValidatorFaq />
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Minifier", href: "/tools/json-minifier", description: "Compress JSON by removing whitespace." },
					{ name: "JSON to TypeScript", href: "/tools/json-to-typescript", description: "Generate TypeScript interfaces from JSON." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
