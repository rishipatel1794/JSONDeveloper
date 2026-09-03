import { GitCompare } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { CodeDiff } from "@/components/tools/code-diff/CodeDiff";
import { CodeDiffFaq } from "@/components/tools/code-diff/CodeDiffFaq";
import { CodeDiffSeoContent } from "@/components/tools/code-diff/CodeDiffSeoContent";

export const metadata = createToolMetadata({
	title: "Code Diff - Compare Code Changes | JSONDeveloper",
	description: "Compare two versions of code and instantly see added, removed, and modified lines with a GitHub-style diff viewer.",
	path: "/code-diff",
	keywords: ["code diff", "diff checker", "compare code", "code comparison tool"],
});

export default function CodeDiffPage() {
	return (
		<main>
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader icon={GitCompare} title="Code Diff" description="Compare two versions of your code and see exactly what changed." />

				<CodeDiff />
			</div>

			<CodeDiffSeoContent />
			<CodeDiffFaq />
		</main>
	);
}
