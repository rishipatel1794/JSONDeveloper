import { Terminal } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { CurlFaq } from "@/components/tools/curl-generator/CurlFaq";
import { CurlGenerator } from "@/components/tools/curl-generator/CurlGenerator";
import { CurlSeoContent } from "@/components/tools/curl-generator/CurlSeoContent";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata = createToolMetadata({
	title: "cURL Generator — Build cURL Commands Online",
	description:
		"Build and generate cURL commands for GET, POST, PUT, PATCH and other HTTP requests with headers, query parameters, JSON bodies, authentication and more.",
	path: "/curl-generator",
	keywords: ["curl command generator", "http curl builder", "api curl tool"],
});

export default function CurlGeneratorPage() {
	return (
		<main>
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Terminal}
					title="cURL Generator"
					description="Build and generate cURL commands for HTTP requests directly in your browser."
				/>

				<CurlGenerator />
			</div>

			<CurlSeoContent />
			<CurlFaq />
		</main>
	);
}
