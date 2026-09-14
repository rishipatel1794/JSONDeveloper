import { Terminal } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { CurlFaq, FAQ_ITEMS } from "@/components/tools/curl-generator/CurlFaq";
import { CurlGenerator } from "@/components/tools/curl-generator/CurlGenerator";
import { CurlSeoContent } from "@/components/tools/curl-generator/CurlSeoContent";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

const TITLE = "cURL Generator — Build cURL Commands Online";
const DESCRIPTION =
	"Build and generate cURL commands for GET, POST, PUT, PATCH and other HTTP requests with headers, query parameters, JSON bodies, authentication and more.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/curl-generator",
	keywords: ["curl command generator", "http curl builder", "api curl tool"],
});

const jsonLd = getToolJsonLd({ name: "cURL Generator", description: DESCRIPTION, path: "/curl-generator" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function CurlGeneratorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={Terminal}
					title="cURL Generator"
					description="Build and generate cURL commands for HTTP requests directly in your browser."
				/>

				<CurlGenerator />
			</ToolPageContainer>

			<CurlSeoContent />
			<CurlFaq />
			<RelatedTools
				tools={[
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
					{ name: "JWT Decoder", href: "/jwt-decoder", description: "Decode and inspect JSON Web Tokens locally." },
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
				]}
			/>
		</main>
	);
}
