import { Regex } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { FAQ_ITEMS, RegexFaq } from "@/components/tools/regex-tester/RegexFaq";
import { RegexSeoContent } from "@/components/tools/regex-tester/RegexSeoContent";
import { RegexTester } from "@/components/tools/regex-tester/RegexTester";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

const TITLE = "Regex Tester — Test Regular Expressions Online";
const DESCRIPTION = "Test and debug regular expressions online with match highlighting, capture groups, flags, and detailed match results.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/regex-tester",
	keywords: ["regex tester", "regular expression tester", "regex debugger"],
});

const jsonLd = getToolJsonLd({ name: "Regex Tester", description: DESCRIPTION, path: "/regex-tester" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function RegexTesterPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer>
				<ToolPageHeader
					icon={Regex}
					title="Regex Tester"
					description="Test and debug regular expressions directly in your browser."
				/>

				<RegexTester />
			</ToolPageContainer>

			<RegexSeoContent />
			<RegexFaq />
			<RelatedTools
				tools={[
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "Code Diff", href: "/code-diff", description: "Compare two versions of code and see exactly what changed." },
					{ name: "SQL Formatter", href: "/sql-formatter", description: "Format and beautify SQL queries instantly." },
				]}
			/>
		</main>
	);
}
