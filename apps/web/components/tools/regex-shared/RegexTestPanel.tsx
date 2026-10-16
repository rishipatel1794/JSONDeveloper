"use client";

import { useEffect, useMemo, useState } from "react";

import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { MatchDetails } from "@/components/tools/regex-tester/MatchDetails";
import { MatchResult } from "@/components/tools/regex-tester/MatchResult";
import { RegexError } from "@/components/tools/regex-tester/RegexError";
import { RegexFlags } from "@/components/tools/regex-tester/RegexFlags";
import { TestStringInput } from "@/components/tools/regex-tester/TestStringInput";
import { LARGE_INPUT_WARNING_LENGTH } from "@/lib/tools/regex/utils";
import { detectPotentialCatastrophicBacktracking } from "@/lib/tools/regex-shared/redosHeuristics";
import { useSafeRegexMatch } from "@/lib/tools/regex-shared/useSafeRegexMatch";
import type { RegexTestResult } from "@/lib/tools/regex/types";

const DEBOUNCE_MS = 300;

interface RegexTestPanelProps {
	pattern: string;
	flags: Set<string>;
	onFlagsChange: (flags: Set<string>) => void;
	testString: string;
	onTestStringChange: (value: string) => void;
}

/**
 * Shared live-testing UI for the Regex Generator and Regex Explainer: flags, test string, and results —
 * all run through `useSafeRegexMatch` so a catastrophically-backtracking pattern can't hang the tab.
 */
export function RegexTestPanel({ pattern, flags, onFlagsChange, testString, onTestStringChange }: RegexTestPanelProps) {
	const { run, isRunning } = useSafeRegexMatch();
	const [result, setResult] = useState<RegexTestResult | null>(null);

	const flagsString = useMemo(() => [...flags].sort().join(""), [flags]);
	const redosWarnings = useMemo(() => detectPotentialCatastrophicBacktracking(pattern), [pattern]);
	const isLargeInput = testString.length > LARGE_INPUT_WARNING_LENGTH;

	useEffect(() => {
		if (!pattern.trim()) {
			setResult(null);
			return;
		}

		let cancelled = false;
		const timeoutId = setTimeout(() => {
			run(pattern, flagsString, testString).then(nextResult => {
				if (!cancelled) setResult(nextResult);
			});
		}, DEBOUNCE_MS);

		return () => {
			cancelled = true;
			clearTimeout(timeoutId);
		};
	}, [pattern, flagsString, testString, run]);

	function toggleFlag(flag: string) {
		const next = new Set(flags);
		if (next.has(flag)) next.delete(flag);
		else next.add(flag);
		onFlagsChange(next);
	}

	return (
		<div className="space-y-4">
			<div>
				<p className="mb-2 text-sm font-medium">Flags</p>
				<RegexFlags flags={flags} onToggle={toggleFlag} />
			</div>

			{redosWarnings.length > 0 && (
				<ToolAlert variant="warning" title="This pattern may be expensive to evaluate">
					<div className="space-y-1">
						{redosWarnings.map(warning => (
							<p key={warning}>{warning}</p>
						))}
						<p>Matching still runs in an isolated worker with a 1-second hard limit, so the page itself can&apos;t freeze — but consider rewriting the pattern to avoid this shape.</p>
					</div>
				</ToolAlert>
			)}

			<TestStringInput value={testString} onChange={onTestStringChange} onTest={() => {}} />

			{isLargeInput && (
				<ToolAlert variant="warning" title="Large input">
					Your test string is {testString.length.toLocaleString()} characters. Matching may take a moment.
				</ToolAlert>
			)}

			<div aria-live="polite" className="space-y-4">
				{isRunning && <p className="text-sm text-muted-foreground">Evaluating…</p>}

				{!isRunning && result && !result.success && <RegexError message={result.error ?? "Invalid regular expression."} />}

				{!isRunning && result && result.success && (
					<>
						<MatchResult testString={testString} matches={result.matches} truncated={result.truncated} />
						<MatchDetails matches={result.matches} />
					</>
				)}

				{!isRunning && !result && <p className="text-sm text-muted-foreground">Enter a pattern and some test text to see live matches.</p>}
			</div>
		</div>
	);
}
