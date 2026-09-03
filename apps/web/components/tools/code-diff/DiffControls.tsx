"use client";

import type { RefObject } from "react";
import { ChevronDown, ChevronUp, Download, Search } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { TabList } from "@/components/ui/Tabs";
import type { DiffStats } from "@/lib/tools/code-diff/diff-engine";

import type { DiffViewMode } from "./DiffView";

interface DiffControlsProps {
	mode: DiffViewMode;
	onModeChange: (mode: DiffViewMode) => void;
	ignoreWhitespace: boolean;
	onIgnoreWhitespaceChange: (value: boolean) => void;
	ignoreEmptyLines: boolean;
	onIgnoreEmptyLinesChange: (value: boolean) => void;
	stats: DiffStats;
	hunkCount: number;
	currentHunkNumber: number | null;
	onPrevHunk: () => void;
	onNextHunk: () => void;
	searchQuery: string;
	onSearchQueryChange: (value: string) => void;
	searchInputRef: RefObject<HTMLInputElement | null>;
	matchCount: number;
	currentMatchNumber: number | null;
	onPrevMatch: () => void;
	onNextMatch: () => void;
	unifiedDiffText: string;
	onDownloadDiff: () => void;
	modifiedCode: string;
}

export function DiffControls({
	mode,
	onModeChange,
	ignoreWhitespace,
	onIgnoreWhitespaceChange,
	ignoreEmptyLines,
	onIgnoreEmptyLinesChange,
	stats,
	hunkCount,
	currentHunkNumber,
	onPrevHunk,
	onNextHunk,
	searchQuery,
	onSearchQueryChange,
	searchInputRef,
	matchCount,
	currentMatchNumber,
	onPrevMatch,
	onNextMatch,
	unifiedDiffText,
	onDownloadDiff,
	modifiedCode,
}: DiffControlsProps) {
	return (
		<div className="space-y-3 border-b border-border bg-secondary/40 px-4 py-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-4">
					<TabList
						aria-label="Diff view mode"
						value={mode}
						onChange={value => onModeChange(value as DiffViewMode)}
						items={[
							{ value: "split", label: "Split" },
							{ value: "unified", label: "Unified" },
						]}
					/>

					<label className="inline-flex items-center gap-1.5 text-sm text-foreground">
						<input
							type="checkbox"
							className="size-4 rounded border-border accent-primary"
							checked={ignoreWhitespace}
							onChange={event => onIgnoreWhitespaceChange(event.target.checked)}
						/>
						Ignore Whitespace
					</label>

					<label className="inline-flex items-center gap-1.5 text-sm text-foreground">
						<input
							type="checkbox"
							className="size-4 rounded border-border accent-primary"
							checked={ignoreEmptyLines}
							onChange={event => onIgnoreEmptyLinesChange(event.target.checked)}
						/>
						Ignore Empty Lines
					</label>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<CopyButton value={unifiedDiffText} label="Copy Diff" ariaLabel="Copy diff to clipboard" />
					<Button onClick={onDownloadDiff} variant="outline" size="sm">
						<Download className="size-3.5" />
						Download Diff
					</Button>
					<CopyButton value={modifiedCode} label="Copy Modified" ariaLabel="Copy modified code to clipboard" />
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-3 text-sm">
					<span className="text-muted-foreground">
						Changes: <span className="font-medium text-foreground">{stats.changes}</span>
					</span>
					<Badge variant="success">+{stats.added} added</Badge>
					<Badge variant="destructive">-{stats.removed} removed</Badge>

					{hunkCount > 0 && (
						<div className="flex items-center gap-1">
							<Button onClick={onPrevHunk} variant="outline" size="sm" aria-label="Previous change" title="Previous change">
								<ChevronUp className="size-3.5" />
							</Button>
							<Button onClick={onNextHunk} variant="outline" size="sm" aria-label="Next change" title="Next change">
								<ChevronDown className="size-3.5" />
							</Button>
							<span className="text-xs text-muted-foreground">
								{currentHunkNumber ?? "–"} / {hunkCount} changes
							</span>
						</div>
					)}
				</div>

				<div className="flex items-center gap-1.5">
					<div className="relative">
						<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
						<input
							ref={searchInputRef}
							type="search"
							value={searchQuery}
							onChange={event => onSearchQueryChange(event.target.value)}
							onKeyDown={event => {
								if (event.key === "Enter") {
									event.preventDefault();
									if (event.shiftKey) onPrevMatch();
									else onNextMatch();
								}
							}}
							placeholder="Search diff… (Ctrl/Cmd+F)"
							aria-label="Search within the diff"
							className="h-8 w-48 rounded-md border border-border bg-card py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
					</div>

					{searchQuery.trim() && (
						<>
							<span className="text-xs text-muted-foreground">{matchCount > 0 ? `${currentMatchNumber}/${matchCount}` : "0/0"}</span>
							<Button onClick={onPrevMatch} variant="ghost" size="sm" disabled={matchCount === 0} aria-label="Previous match">
								<ChevronUp className="size-3.5" />
							</Button>
							<Button onClick={onNextMatch} variant="ghost" size="sm" disabled={matchCount === 0} aria-label="Next match">
								<ChevronDown className="size-3.5" />
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
