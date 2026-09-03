"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";
import type { DiffLine, DiffResult } from "@/lib/tools/code-diff/diff-engine";

import { useIsNarrowViewport } from "./useIsNarrowViewport";

export interface DiffViewHandle {
	scrollToLine: (index: number) => void;
}

export type DiffViewMode = "split" | "unified";

interface DiffViewProps {
	result: DiffResult;
	mode: DiffViewMode;
	originalHighlighted: string[] | null;
	modifiedHighlighted: string[] | null;
	searchQuery: string;
	activeLineIndex: number | null;
}

const NUMBER_CELL = "select-none px-2 text-right text-muted-foreground/70 tabular-nums";
const MARKER_CELL = "select-none pl-1 pr-2 text-center font-semibold";

function rowBackground(type: DiffLine["type"]): string {
	if (type === "added") return "bg-success-muted";
	if (type === "removed") return "bg-destructive-muted";
	return "";
}

function markerFor(type: DiffLine["type"]): string {
	if (type === "added") return "+";
	if (type === "removed") return "-";
	return "";
}

function markerColor(type: DiffLine["type"]): string {
	if (type === "added") return "text-success-muted-foreground";
	if (type === "removed") return "text-destructive-muted-foreground";
	return "text-transparent";
}

export function lineMatchesQuery(line: DiffLine, query: string): boolean {
	if (!query) return false;
	const haystack = `${line.oldContent ?? ""}\n${line.newContent ?? ""}`.toLowerCase();
	return haystack.includes(query);
}

function CodeCell({ content, highlighted }: { content: string | null; highlighted?: string }) {
	if (content === null) return <span />;
	if (highlighted !== undefined) {
		// Monaco's colorizer already escapes the source text into span-wrapped tokens.
		return <span dangerouslySetInnerHTML={{ __html: highlighted || "&nbsp;" }} />;
	}
	return <span>{content.length ? content : " "}</span>;
}

export const DiffView = forwardRef<DiffViewHandle, DiffViewProps>(function DiffView(
	{ result, mode, originalHighlighted, modifiedHighlighted, searchQuery, activeLineIndex },
	ref,
) {
	const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
	const isNarrow = useIsNarrowViewport();
	const effectiveMode: DiffViewMode = mode === "split" && isNarrow ? "unified" : mode;
	const query = searchQuery.trim().toLowerCase();

	useImperativeHandle(ref, () => ({
		scrollToLine(index: number) {
			rowRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
		},
	}));

	if (effectiveMode === "unified") {
		return (
			<div className="overflow-x-auto">
				<div className="grid min-w-max grid-cols-[3rem_3rem_1.5rem_1fr] font-mono text-[13px] leading-6">
					{result.lines.map((line, index) => {
						const isMatch = lineMatchesQuery(line, query);
						const content = line.type === "removed" ? line.oldContent : line.newContent;
						const highlighted =
							line.type === "removed"
								? (originalHighlighted?.[line.oldLineNumber! - 1] ?? undefined)
								: (modifiedHighlighted?.[line.newLineNumber! - 1] ?? undefined);

						return (
							<div
								key={index}
								ref={el => {
									rowRefs.current[index] = el;
								}}
								className={cn(
									"col-span-4 grid grid-cols-subgrid",
									rowBackground(line.type),
									isMatch && "ring-1 ring-inset ring-warning",
									activeLineIndex === index && "ring-2 ring-inset ring-primary",
								)}
							>
								<span className={NUMBER_CELL}>{line.oldLineNumber ?? ""}</span>
								<span className={NUMBER_CELL}>{line.newLineNumber ?? ""}</span>
								<span className={cn(MARKER_CELL, markerColor(line.type))} aria-hidden="true">
									{markerFor(line.type) || " "}
								</span>
								<span className="whitespace-pre pr-4">
									<CodeCell content={content} highlighted={highlighted} />
								</span>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<div className="grid min-w-max grid-cols-[3rem_1.5rem_1fr_3rem_1.5rem_1fr] divide-x divide-border font-mono text-[13px] leading-6">
				{result.lines.map((line, index) => {
					const isMatch = lineMatchesQuery(line, query);
					const isFocused = activeLineIndex === index;
					const oldHighlighted = line.oldLineNumber !== null ? (originalHighlighted?.[line.oldLineNumber - 1] ?? undefined) : undefined;
					const newHighlighted = line.newLineNumber !== null ? (modifiedHighlighted?.[line.newLineNumber - 1] ?? undefined) : undefined;

					return (
						<div
							key={index}
							ref={el => {
								rowRefs.current[index] = el;
							}}
							className={cn("col-span-6 grid grid-cols-subgrid", isMatch && "ring-1 ring-inset ring-warning", isFocused && "ring-2 ring-inset ring-primary")}
						>
							<span className={cn(NUMBER_CELL, rowBackground(line.type === "added" ? "unchanged" : line.type))}>{line.oldLineNumber ?? ""}</span>
							<span
								className={cn(MARKER_CELL, rowBackground(line.type === "added" ? "unchanged" : line.type), markerColor(line.type === "added" ? "unchanged" : line.type))}
								aria-hidden="true"
							>
								{line.type === "removed" ? "-" : " "}
							</span>
							<span className={cn("whitespace-pre pr-4", rowBackground(line.type === "added" ? "unchanged" : line.type))}>
								<CodeCell content={line.oldContent} highlighted={oldHighlighted} />
							</span>

							<span className={cn(NUMBER_CELL, rowBackground(line.type === "removed" ? "unchanged" : line.type))}>{line.newLineNumber ?? ""}</span>
							<span
								className={cn(MARKER_CELL, rowBackground(line.type === "removed" ? "unchanged" : line.type), markerColor(line.type === "removed" ? "unchanged" : line.type))}
								aria-hidden="true"
							>
								{line.type === "added" ? "+" : " "}
							</span>
							<span className={cn("whitespace-pre pr-4", rowBackground(line.type === "removed" ? "unchanged" : line.type))}>
								<CodeCell content={line.newContent} highlighted={newHighlighted} />
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
});
