import { Send } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ApiFaq } from "@/components/tools/api-client/ApiFaq";
import { ApiSeoContent } from "@/components/tools/api-client/ApiSeoContent";
import { ApiWorkspace } from "@/components/tools/api-client/ApiWorkspace";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata = createToolMetadata({
	title: "API Client — Test REST APIs Online",
	description:
		"Send and inspect HTTP API requests with headers, query parameters, authentication, request bodies, response data, and more.",
	path: "/api-client",
	keywords: ["rest api client", "http request tester", "api testing tool"],
});

export default function ApiClientPage() {
	return (
		<main>
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
		</main>
	);
}
