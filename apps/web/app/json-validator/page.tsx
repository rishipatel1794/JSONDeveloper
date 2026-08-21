import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JsonValidator } from "@/components/tools/json-validator/JsonValidator";
import { JsonValidatorFaq } from "@/components/tools/json-validator/JsonValidatorFaq";
import { JsonValidatorSeoContent } from "@/components/tools/json-validator/JsonValidatorSeoContent";

export const metadata: Metadata = {
	title: "JSON Validator & Analyzer",
	description:
		"Validate JSON, find syntax errors, detect duplicate keys, analyze JSON structure and validate JSON against JSON Schema.",
};

export default function JsonValidatorPage() {
	return (
		<main>
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={ShieldCheck}
					title="JSON Validator"
					description="Validate, debug, and analyze JSON instantly."
				/>

				<JsonValidator />
			</div>

			<JsonValidatorSeoContent />
			<JsonValidatorFaq />
		</main>
	);
}
