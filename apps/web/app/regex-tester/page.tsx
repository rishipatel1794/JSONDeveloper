import { Regex } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { RegexFaq } from "@/components/tools/regex-tester/RegexFaq";
import { RegexSeoContent } from "@/components/tools/regex-tester/RegexSeoContent";
import { RegexTester } from "@/components/tools/regex-tester/RegexTester";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata = createToolMetadata({
	title: "Regex Tester — Test Regular Expressions Online",
	description:
		"Test and debug regular expressions online with match highlighting, capture groups, flags, and detailed match results.",
	path: "/regex-tester",
	keywords: ["regex tester", "regular expression tester", "regex debugger"],
});

export default function RegexTesterPage() {
	return (
		<main>
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Regex}
					title="Regex Tester"
					description="Test and debug regular expressions directly in your browser."
				/>

				<RegexTester />
			</div>

			<RegexSeoContent />
			<RegexFaq />
		</main>
	);
}
