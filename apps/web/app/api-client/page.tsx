import { Send } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { ApiFaq, FAQ_ITEMS } from "@/components/tools/api-client/ApiFaq";
import { ApiSeoContent } from "@/components/tools/api-client/ApiSeoContent";
import { ApiWorkspace } from "@/components/tools/api-client/ApiWorkspace";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

const TITLE = "API Client — Test REST APIs Online";
const DESCRIPTION = "Send and inspect HTTP API requests with headers, query parameters, authentication, request bodies, response data, and more.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/api-client",
	keywords: ["rest api client", "http request tester", "api testing tool"],
});

const jsonLd = getToolJsonLd({ name: "API Client", description: DESCRIPTION, path: "/api-client" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function ApiClientPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<div className="container mx-auto max-w-[1600px] px-4 py-6">
				<ToolPageHeader
					icon={Send}
					title="API Client"
					description="Build collections, manage environments, and send HTTP requests directly from your browser."
				/>

				<ApiWorkspace />
			</div>

			<ApiSeoContent />
			<ApiFaq />
			<RelatedTools
				tools={[
					{ name: "cURL Generator", href: "/curl-generator", description: "Build and generate cURL commands for HTTP requests." },
					{ name: "JWT Decoder", href: "/jwt-decoder", description: "Decode and inspect JSON Web Tokens locally." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
				]}
			/>
		</main>
	);
}
