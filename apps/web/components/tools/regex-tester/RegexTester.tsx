"use client";

import { useState } from "react";

import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { testRegex } from "@/lib/tools/regex/tester";
import type { RegexTestResult } from "@/lib/tools/regex/types";
import { LARGE_INPUT_WARNING_LENGTH, REGEX_EXAMPLES } from "@/lib/tools/regex/utils";

import { MatchDetails } from "./MatchDetails";
import { MatchResult } from "./MatchResult";
import { RegexError } from "./RegexError";
import { RegexFlags } from "./RegexFlags";
import { RegexInput } from "./RegexInput";
import { RegexToolbar } from "./RegexToolbar";
import { TestStringInput } from "./TestStringInput";

const DEFAULT_FLAGS = ["g"];

export function RegexTester() {
	const [pattern, setPattern] = useState("");
	const [flags, setFlags] = useState<Set<string>>(new Set(DEFAULT_FLAGS));
	const [testString, setTestString] = useState("");
	const [result, setResult] = useState<RegexTestResult | null>(null);

	const flagsString = Array.from(flags).join("");

	function runTest() {
		if (!pattern.trim()) {
			setResult(null);
			return;
		}

		setResult(testRegex(pattern, flagsString, testString));
	}

	function toggleFlag(flag: string) {
		setFlags(prev => {
			const next = new Set(prev);
			if (next.has(flag)) {
				next.delete(flag);
			} else {
				next.add(flag);
			}
			return next;
		});
	}

	function handleClear() {
		setPattern("");
		setFlags(new Set(DEFAULT_FLAGS));
		setTestString("");
		setResult(null);
	}

	function handleLoadExample(index: number) {
		const example = REGEX_EXAMPLES[index];
		if (!example) return;

		setPattern(example.pattern);
		setFlags(new Set(example.flags.split("")));
		setTestString(example.sampleText);
		setResult(testRegex(example.pattern, example.flags, example.sampleText));
	}

	const isLargeInput = testString.length > LARGE_INPUT_WARNING_LENGTH;

	return (
		<div className="space-y-4">
			<div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
				<div>
					<p className="mb-2 text-sm font-medium">Regular Expression</p>
					<RegexInput pattern={pattern} onChange={setPattern} onTest={runTest} />
				</div>

				<div>
					<p className="mb-2 text-sm font-medium">Flags</p>
					<RegexFlags flags={flags} onToggle={toggleFlag} />
				</div>

				<RegexToolbar pattern={pattern} flags={flagsString} onTest={runTest} onClear={handleClear} onLoadExample={handleLoadExample} />
			</div>

			<TestStringInput value={testString} onChange={setTestString} onTest={runTest} />

			{isLargeInput && (
				<ToolAlert variant="warning" title="Large input">
					Your test string is {testString.length.toLocaleString()} characters. Some regular expressions can be
					computationally expensive on large inputs — use complex patterns carefully.
				</ToolAlert>
			)}

			<div aria-live="polite" className="space-y-4">
				{result && !result.success && <RegexError message={result.error ?? "Invalid regular expression."} />}

				{result && result.success && (
					<>
						<MatchResult testString={testString} matches={result.matches} truncated={result.truncated} />
						<MatchDetails matches={result.matches} />
					</>
				)}

				{!result && (
					<p className="text-sm text-muted-foreground">Enter a regular expression and click Test Regex to see results.</p>
				)}
			</div>
		</div>
	);
}
