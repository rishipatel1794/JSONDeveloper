import { Regex } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { RegexExplainer } from "@/components/tools/regex-explainer/RegexExplainer";
import { FAQ_ITEMS, RegexExplainerFaq } from "@/components/tools/regex-explainer/RegexExplainerFaq";
import { RegexExplainerSeoContent } from "@/components/tools/regex-explainer/RegexExplainerSeoContent";

const TITLE = "Regex Explainer Online - Understand Regular Expressions";
const DESCRIPTION = "Paste any regular expression to understand its tokens, groups, quantifiers, character classes, flags, and matching behavior with interactive examples.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/regex-explainer",
	keywords: [
		"regex explainer",
		"explain regex",
		"regex breakdown",
		"what does this regex mean",
		"regex visualizer",
		"understand regular expression",
	],
});

const jsonLd = getToolJsonLd({ name: "Regex Explainer", description: DESCRIPTION, path: "/regex-explainer" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function RegexExplainerPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={Regex}
					title="Regex Explainer"
					description="Paste a pattern to see a token-by-token breakdown, a plain-English summary, and live matches."
				/>

				<RegexExplainer />
			</ToolPageContainer>

			<RegexExplainerSeoContent />
			<RegexExplainerFaq />
			<RelatedTools
				tools={[
					{ name: "Regex Generator", href: "/regex-generator", description: "Build a regular expression from a template or requirements." },
					{ name: "Regex Tester", href: "/regex-tester", description: "Test and debug regular expressions instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate, check, and debug JSON instantly." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
				]}
			/>
		</main>
	);
}
