import { Regex } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { RegexGenerator } from "@/components/tools/regex-generator/RegexGenerator";
import { FAQ_ITEMS, RegexGeneratorFaq } from "@/components/tools/regex-generator/RegexGeneratorFaq";
import { RegexGeneratorSeoContent } from "@/components/tools/regex-generator/RegexGeneratorSeoContent";

const TITLE = "Regex Generator Online - Build and Test Regular Expressions";
const DESCRIPTION = "Generate regular expressions for emails, URLs, phone numbers, passwords, dates, and custom patterns. Test matches instantly with real examples.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/regex-generator",
	keywords: [
		"regex generator",
		"generate regular expression",
		"regex builder online",
		"regex for email",
		"regex for password",
		"create regex pattern",
	],
});

const jsonLd = getToolJsonLd({ name: "Regex Generator", description: DESCRIPTION, path: "/regex-generator" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function RegexGeneratorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={Regex}
					title="Regex Generator"
					description="Build a regular expression from a template, structured requirements, or examples — then test it live."
				/>

				<RegexGenerator />
			</ToolPageContainer>

			<RegexGeneratorSeoContent />
			<RegexGeneratorFaq />
			<RelatedTools
				tools={[
					{ name: "Regex Explainer", href: "/regex-explainer", description: "Understand any regex pattern token by token." },
					{ name: "Regex Tester", href: "/regex-tester", description: "Test and debug regular expressions instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate, check, and debug JSON instantly." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
