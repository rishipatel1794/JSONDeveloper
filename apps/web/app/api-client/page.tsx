import type { Metadata } from "next";
import { Send } from "lucide-react";

import { ApiFaq } from "@/components/tools/api-client/ApiFaq";
import { ApiSeoContent } from "@/components/tools/api-client/ApiSeoContent";
import { ApiWorkspace } from "@/components/tools/api-client/ApiWorkspace";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata: Metadata = {
	title: "API Client — Test REST APIs Online",
	description:
		"Send and inspect HTTP API requests with headers, query parameters, authentication, request bodies, response data, and more.",
};

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
