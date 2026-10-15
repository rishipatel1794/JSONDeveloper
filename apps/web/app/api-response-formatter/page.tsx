import { Braces } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { ApiResponseFormatter } from "@/components/tools/api-response-formatter/ApiResponseFormatter";
import { ApiResponseFormatterFaq, FAQ_ITEMS } from "@/components/tools/api-response-formatter/ApiResponseFormatterFaq";
import { ApiResponseFormatterSeoContent } from "@/components/tools/api-response-formatter/ApiResponseFormatterSeoContent";

const TITLE = "API Response Formatter Online - Format JSON API Responses";
const DESCRIPTION = "Format, validate, and inspect API JSON responses online. Analyze response structure, headers, status codes, pagination, and common API response design issues.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/api-response-formatter",
	keywords: [
		"api response formatter",
		"format api response online",
		"json api response analyzer",
		"api response validator",
		"pretty print api response",
		"api response structure checker",
	],
});

const jsonLd = getToolJsonLd({ name: "API Response Formatter", description: DESCRIPTION, path: "/api-response-formatter" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function ApiResponseFormatterPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={Braces}
					title="API Response Formatter"
					description="Format, validate, and analyze API JSON responses — structure, status codes, and common design issues."
				/>

				<ApiResponseFormatter />
			</ToolPageContainer>

			<ApiResponseFormatterSeoContent />
			<ApiResponseFormatterFaq />
			<RelatedTools
				tools={[
					{ name: "HTTP Status Code Reference", href: "/http-status-codes", description: "Look up what every HTTP status code means." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate, debug, and analyze JSON instantly." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
					{ name: "JWT Generator", href: "/jwt-generator", description: "Create and sign JSON Web Tokens for testing." },
				]}
			/>
		</main>
	);
}
