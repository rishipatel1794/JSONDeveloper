import { GitCompare } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { CodeDiff } from "@/components/tools/code-diff/CodeDiff";
import { CodeDiffFaq } from "@/components/tools/code-diff/CodeDiffFaq";
import { CodeDiffSeoContent } from "@/components/tools/code-diff/CodeDiffSeoContent";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";

export const metadata = createToolMetadata({
	title: "Code Diff - Compare Code Changes",
	description: "Compare two versions of code and instantly see added, removed, and modified lines with a GitHub-style diff viewer.",
	path: "/code-diff",
	keywords: ["code diff", "diff checker", "compare code", "code comparison tool"],
});

export default function CodeDiffPage() {
	return (
		<main>
			<ToolPageContainer wide>
				<ToolPageHeader icon={GitCompare} title="Code Diff" description="Compare two versions of your code and see exactly what changed." />

				<CodeDiff />
			</ToolPageContainer>

			<CodeDiffSeoContent />
			<CodeDiffFaq />
		</main>
	);
}
