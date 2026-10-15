import { KeyRound } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { HttpStatusCodes } from "@/components/tools/http-status-codes/HttpStatusCodes";
import { FAQ_ITEMS, HttpStatusCodesFaq } from "@/components/tools/http-status-codes/HttpStatusCodesFaq";
import { HttpStatusCodesSeoContent } from "@/components/tools/http-status-codes/HttpStatusCodesSeoContent";

const TITLE = "HTTP Status Codes Reference - Complete HTTP Code List";
const DESCRIPTION = "Explore HTTP status codes from 100 to 599. Understand HTTP response codes, their meanings, common use cases, and API examples.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/http-status-codes",
	keywords: [
		"http status codes",
		"http status code reference",
		"http response codes",
		"status code list",
		"404 meaning",
		"500 error meaning",
		"http error codes explained",
	],
});

const jsonLd = getToolJsonLd({ name: "HTTP Status Code Reference", description: DESCRIPTION, path: "/http-status-codes" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function HttpStatusCodesPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={KeyRound}
					title="HTTP Status Code Reference"
					description="Search every HTTP status code, when to use it, and real API examples."
				/>

				<HttpStatusCodes />
			</ToolPageContainer>

			<HttpStatusCodesSeoContent />
			<HttpStatusCodesFaq />
			<RelatedTools
				tools={[
					{ name: "API Response Formatter", href: "/api-response-formatter", description: "Format, validate, and analyze API JSON responses." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
					{ name: "cURL Generator", href: "/curl-generator", description: "Build and generate cURL commands for HTTP requests." },
					{ name: "JWT Generator", href: "/jwt-generator", description: "Create and sign JSON Web Tokens for testing." },
				]}
			/>
		</main>
	);
}
