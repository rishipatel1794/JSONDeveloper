"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, GitCompare, Shuffle, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { computeDiff, generateUnifiedDiffText } from "@/lib/tools/code-diff/diff-engine";
import { detectLanguage, LANGUAGE_OPTIONS, resolveMonacoLanguage } from "@/lib/tools/code-diff/languages";
import { EXAMPLE_LANGUAGE, EXAMPLE_MODIFIED_CODE, EXAMPLE_ORIGINAL_CODE } from "@/lib/tools/code-diff/examples";

import { CodeInputPanel } from "./CodeInputPanel";
import { DiffControls } from "./DiffControls";
import { DiffView, lineMatchesQuery, type DiffViewHandle, type DiffViewMode } from "./DiffView";
import { useHighlightedLines } from "./useHighlightedLines";

const selectClasses =
	"rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function downloadTextFile(filename: string, content: string) {
	const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

export function CodeDiff() {
	const [originalCode, setOriginalCode] = useState("");
	const [modifiedCode, setModifiedCode] = useState("");
	const [language, setLanguage] = useState("auto");

	const [comparedOriginal, setComparedOriginal] = useState("");
	const [comparedModified, setComparedModified] = useState("");
	const [hasCompared, setHasCompared] = useState(false);
	const [isComparing, setIsComparing] = useState(false);

	const [viewMode, setViewMode] = useState<DiffViewMode>("split");
	const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
	const [ignoreEmptyLines, setIgnoreEmptyLines] = useState(false);
	const [currentHunkIndex, setCurrentHunkIndex] = useState<number | null>(null);

	const [searchQuery, setSearchQuery] = useState("");
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const diffViewRef = useRef<DiffViewHandle>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const resultSectionRef = useRef<HTMLDivElement>(null);

	const monacoLanguage = useMemo(() => {
		if (language !== "auto") return resolveMonacoLanguage(language);
		return resolveMonacoLanguage(detectLanguage(originalCode || modifiedCode));
	}, [language, originalCode, modifiedCode]);

	const diffResult = useMemo(() => {
		if (!hasCompared) return null;
		return computeDiff(comparedOriginal, comparedModified, { ignoreWhitespace, ignoreEmptyLines });
	}, [hasCompared, comparedOriginal, comparedModified, ignoreWhitespace, ignoreEmptyLines]);

	const originalHighlighted = useHighlightedLines(comparedOriginal, monacoLanguage);
	const modifiedHighlighted = useHighlightedLines(comparedModified, monacoLanguage);

	const unifiedDiffText = useMemo(
		() => (hasCompared ? generateUnifiedDiffText(comparedOriginal, comparedModified, { originalLabel: "original", modifiedLabel: "modified", ignoreWhitespace }) : ""),
		[hasCompared, comparedOriginal, comparedModified, ignoreWhitespace],
	);

	const searchMatches = useMemo(() => {
		if (!diffResult) return [];
		const query = searchQuery.trim().toLowerCase();
		if (!query) return [];
		return diffResult.lines.reduce<number[]>((matches, line, index) => {
			if (lineMatchesQuery(line, query)) matches.push(index);
			return matches;
		}, []);
	}, [diffResult, searchQuery]);

	useEffect(() => {
		setCurrentMatchIndex(0);
	}, [searchQuery]);

	useEffect(() => {
		if (searchMatches.length === 0) return;
		diffViewRef.current?.scrollToLine(searchMatches[currentMatchIndex % searchMatches.length]!);
	}, [searchMatches, currentMatchIndex]);

	useEffect(() => {
		if (!diffResult) return;

		function handleKeyDown(event: KeyboardEvent) {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
				event.preventDefault();
				searchInputRef.current?.focus();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [diffResult]);

	function runCompare(nextOriginal: string, nextModified: string) {
		setErrorMessage(null);

		if (!nextOriginal.trim() && !nextModified.trim()) {
			setErrorMessage("Paste or upload code in at least one editor before comparing.");
			return;
		}

		setIsComparing(true);
		setSearchQuery("");
		setCurrentHunkIndex(null);

		// Yield one tick so the "Comparing…" state can paint before the (synchronous) diff runs.
		window.setTimeout(() => {
			setComparedOriginal(nextOriginal);
			setComparedModified(nextModified);
			setHasCompared(true);
			setIsComparing(false);
			resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 20);
	}

	function handleSwap() {
		setOriginalCode(modifiedCode);
		setModifiedCode(originalCode);
		if (hasCompared) runCompare(modifiedCode, originalCode);
	}

	function handleLoadExample() {
		setOriginalCode(EXAMPLE_ORIGINAL_CODE);
		setModifiedCode(EXAMPLE_MODIFIED_CODE);
		setLanguage(EXAMPLE_LANGUAGE);
		runCompare(EXAMPLE_ORIGINAL_CODE, EXAMPLE_MODIFIED_CODE);
	}

	function goToHunk(direction: 1 | -1) {
		if (!diffResult || diffResult.hunks.length === 0) return;
		const count = diffResult.hunks.length;
		const nextIndex = currentHunkIndex === null ? 0 : (currentHunkIndex + direction + count) % count;
		setCurrentHunkIndex(nextIndex);
		diffViewRef.current?.scrollToLine(diffResult.hunks[nextIndex]!.startIndex);
	}

	function goToMatch(direction: 1 | -1) {
		if (searchMatches.length === 0) return;
		setCurrentMatchIndex(previous => (previous + direction + searchMatches.length) % searchMatches.length);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<label className="flex items-center gap-2 text-sm text-muted-foreground">
					Language
					<select value={language} onChange={event => setLanguage(event.target.value)} className={selectClasses} aria-label="Language for syntax highlighting">
						{LANGUAGE_OPTIONS.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>

				<Button onClick={handleLoadExample} variant="ghost" size="sm">
					<Sparkles className="size-3.5" />
					Load Example
				</Button>
			</div>

			{errorMessage && (
				<div className="flex items-start justify-between gap-3 rounded-lg border border-destructive-border bg-destructive-muted px-4 py-3 text-sm text-destructive-muted-foreground">
					<span>{errorMessage}</span>
					<button type="button" onClick={() => setErrorMessage(null)} aria-label="Dismiss error" className="shrink-0 text-destructive-muted-foreground/70 hover:text-destructive-muted-foreground">
						<X className="size-4" />
					</button>
				</div>
			)}

			<div className="grid gap-4 lg:grid-cols-2">
				<CodeInputPanel title="Original Code" value={originalCode} onChange={setOriginalCode} monacoLanguage={monacoLanguage} canFormat={language === "json"} onError={setErrorMessage} />
				<CodeInputPanel title="Modified Code" value={modifiedCode} onChange={setModifiedCode} monacoLanguage={monacoLanguage} canFormat={language === "json"} onError={setErrorMessage} />
			</div>

			<div className="flex items-center justify-center gap-3">
				<Button onClick={handleSwap} variant="outline" size="sm">
					<Shuffle className="size-3.5" />
					Swap
				</Button>
				<Button onClick={() => runCompare(originalCode, modifiedCode)} variant="primary" size="md" disabled={isComparing}>
					<GitCompare className="size-4" />
					{isComparing ? "Comparing…" : "Compare"}
				</Button>
			</div>

			<div ref={resultSectionRef} className="scroll-mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="border-b border-border bg-secondary px-4 py-2.5 text-sm font-medium">Diff Result</div>

				{!hasCompared || isComparing ? (
					<div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
						{isComparing ? (
							<p className="text-sm text-muted-foreground">Comparing…</p>
						) : (
							<>
								<GitCompare className="size-8 text-muted-foreground/50" />
								<p className="font-medium text-foreground">Compare two versions of your code</p>
								<p className="max-w-sm text-sm text-muted-foreground">Paste or upload your original and modified code above, then click Compare to see the differences.</p>
							</>
						)}
					</div>
				) : diffResult && diffResult.identical ? (
					<div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
						<CheckCircle2 className="size-8 text-success" />
						<p className="font-medium text-foreground">✓ No changes detected</p>
						<p className="text-sm text-muted-foreground">The two code versions are identical.</p>
					</div>
				) : (
					diffResult && (
						<>
							<DiffControls
								mode={viewMode}
								onModeChange={setViewMode}
								ignoreWhitespace={ignoreWhitespace}
								onIgnoreWhitespaceChange={setIgnoreWhitespace}
								ignoreEmptyLines={ignoreEmptyLines}
								onIgnoreEmptyLinesChange={setIgnoreEmptyLines}
								stats={diffResult.stats}
								hunkCount={diffResult.hunks.length}
								currentHunkNumber={currentHunkIndex === null ? null : currentHunkIndex + 1}
								onPrevHunk={() => goToHunk(-1)}
								onNextHunk={() => goToHunk(1)}
								searchQuery={searchQuery}
								onSearchQueryChange={setSearchQuery}
								searchInputRef={searchInputRef}
								matchCount={searchMatches.length}
								currentMatchNumber={searchMatches.length === 0 ? null : (currentMatchIndex % searchMatches.length) + 1}
								onPrevMatch={() => goToMatch(-1)}
								onNextMatch={() => goToMatch(1)}
								unifiedDiffText={unifiedDiffText}
								onDownloadDiff={() => downloadTextFile("comparison.diff", unifiedDiffText)}
								modifiedCode={modifiedCode}
							/>

							<DiffView
								ref={diffViewRef}
								result={diffResult}
								mode={viewMode}
								originalHighlighted={originalHighlighted}
								modifiedHighlighted={modifiedHighlighted}
								searchQuery={searchQuery}
								activeLineIndex={currentHunkIndex === null ? null : diffResult.hunks[currentHunkIndex]?.startIndex ?? null}
							/>
						</>
					)
				)}
			</div>
		</div>
	);
}
