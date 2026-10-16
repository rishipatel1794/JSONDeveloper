"use client";

import { useMemo, useState } from "react";

import { RegexError } from "@/components/tools/regex-tester/RegexError";
import { RegexTestPanel } from "@/components/tools/regex-shared/RegexTestPanel";
import { describePatternInPlainEnglish } from "@/lib/tools/regex-explainer/plainEnglish";
import { parseRegexPattern } from "@/lib/tools/regex-explainer/parser";
import { tokenizePattern } from "@/lib/tools/regex-explainer/tokenize";
import { buildVisualTree } from "@/lib/tools/regex-explainer/visualTree";
import type { ExplainerExample } from "@/lib/tools/regex-explainer/examples";

import { ExampleLibrary } from "./ExampleLibrary";
import { PatternInput } from "./PatternInput";
import { PlainEnglishSummary } from "./PlainEnglishSummary";
import { RegexExplainerPrivacyNotice } from "./RegexExplainerPrivacyNotice";
import { TokenBreakdownTable } from "./TokenBreakdownTable";
import { VisualStructureTree } from "./VisualStructureTree";

const SAMPLE_PATTERN = "^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$";

export function RegexExplainer() {
	const [pattern, setPattern] = useState(SAMPLE_PATTERN);
	const [flags, setFlags] = useState<Set<string>>(new Set());
	const [testString, setTestString] = useState("Str0ngPass!");

	const flagsString = useMemo(() => [...flags].sort().join(""), [flags]);
	const parseResult = useMemo(() => (pattern.trim() ? parseRegexPattern(pattern, flagsString) : null), [pattern, flagsString]);

	const tokens = useMemo(() => (parseResult?.success ? tokenizePattern(parseResult.pattern) : []), [parseResult]);
	const tree = useMemo(() => buildVisualTree(tokens), [tokens]);
	const summary = useMemo(() => (parseResult?.success ? describePatternInPlainEnglish(parseResult.pattern) : ""), [parseResult]);

	function handleSelectExample(example: ExplainerExample) {
		setPattern(example.pattern);
		setFlags(new Set(example.flags.split("").filter(Boolean)));
		setTestString(example.testInput);
	}

	return (
		<div className="space-y-4">
			<RegexExplainerPrivacyNotice />

			<ExampleLibrary onSelect={handleSelectExample} />

			<PatternInput pattern={pattern} onChange={setPattern} />

			{parseResult && !parseResult.success && <RegexError message={parseResult.error} />}

			{parseResult && parseResult.success && (
				<>
					<PlainEnglishSummary summary={summary} />
					<div className="grid gap-4 lg:grid-cols-2">
						<TokenBreakdownTable rows={tokens} />
						<VisualStructureTree nodes={tree} />
					</div>
				</>
			)}

			<RegexTestPanel pattern={pattern} flags={flags} onFlagsChange={setFlags} testString={testString} onTestStringChange={setTestString} />
		</div>
	);
}
