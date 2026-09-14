import { GitCompare } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { CodeDiff } from "@/components/tools/code-diff/CodeDiff";
import { CodeDiffFaq, FAQ_ITEMS } from "@/components/tools/code-diff/CodeDiffFaq";
import { CodeDiffSeoContent } from "@/components/tools/code-diff/CodeDiffSeoContent";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";

const TITLE = "Code Diff - Compare Code Changes";
const DESCRIPTION = "Compare two versions of code and instantly see added, removed, and modified lines with a GitHub-style diff viewer.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/code-diff",
	keywords: ["code diff", "diff checker", "compare code", "code comparison tool"],
});

const jsonLd = getToolJsonLd({ name: "Code Diff", description: DESCRIPTION, path: "/code-diff" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function CodeDiffPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader icon={GitCompare} title="Code Diff" description="Compare two versions of your code and see exactly what changed." />

				<CodeDiff />
			</ToolPageContainer>

			<CodeDiffSeoContent />
			<CodeDiffFaq />
			<RelatedTools
				tools={[
					{ name: "Regex Tester", href: "/regex-tester", description: "Test and debug regular expressions instantly." },
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "SQL Formatter", href: "/sql-formatter", description: "Format and beautify SQL queries instantly." },
				]}
			/>
		</main>
	);
}
