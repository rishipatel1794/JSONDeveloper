import { createTwoFilesPatch, diffArrays } from "diff";

export type DiffLineType = "unchanged" | "added" | "removed";

export interface DiffLine {
	type: DiffLineType;
	oldLineNumber: number | null;
	newLineNumber: number | null;
	oldContent: string | null;
	newContent: string | null;
}

/** A maximal contiguous run of non-unchanged lines — one navigable "change" for Previous/Next. */
export interface DiffHunk {
	startIndex: number;
	endIndex: number;
}

export interface DiffStats {
	added: number;
	removed: number;
	changes: number;
}

export interface DiffOptions {
	ignoreWhitespace?: boolean;
	ignoreEmptyLines?: boolean;
}

export interface DiffResult {
	lines: DiffLine[];
	hunks: DiffHunk[];
	stats: DiffStats;
	identical: boolean;
}

interface LineItem {
	lineNumber: number;
	content: string;
}

function toLineItems(text: string): LineItem[] {
	if (text === "") return [];

	const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const rawLines = normalized.split("\n");

	// A trailing newline produces one extra empty element after split — drop it so the
	// reported line count matches what the user actually sees, unless the whole text is blank.
	if (rawLines.length > 1 && rawLines[rawLines.length - 1] === "") {
		rawLines.pop();
	}

	return rawLines.map((content, index) => ({ lineNumber: index + 1, content }));
}

function isBlank(content: string): boolean {
	return content.trim() === "";
}

/**
 * Line-based diff of two code strings. Uses `diff`'s array diffing (not raw string comparison)
 * over per-line items so line numbers survive filtering (e.g. ignoreEmptyLines) and whitespace-only
 * differences can be treated as equal without losing the original text.
 */
export function computeDiff(original: string, modified: string, options: DiffOptions = {}): DiffResult {
	const { ignoreWhitespace = false, ignoreEmptyLines = false } = options;

	let oldItems = toLineItems(original);
	let newItems = toLineItems(modified);

	if (ignoreEmptyLines) {
		oldItems = oldItems.filter(item => !isBlank(item.content));
		newItems = newItems.filter(item => !isBlank(item.content));
	}

	const comparator = ignoreWhitespace
		? (a: LineItem, b: LineItem) => a.content.trim() === b.content.trim()
		: (a: LineItem, b: LineItem) => a.content === b.content;

	const changes = diffArrays(oldItems, newItems, { comparator });

	const lines: DiffLine[] = [];
	let oldCursor = 0;

	for (const change of changes) {
		const items = change.value;

		if (change.added) {
			for (const item of items) {
				lines.push({ type: "added", oldLineNumber: null, newLineNumber: item.lineNumber, oldContent: null, newContent: item.content });
			}
			continue;
		}

		if (change.removed) {
			for (const item of items) {
				lines.push({ type: "removed", oldLineNumber: item.lineNumber, newLineNumber: null, oldContent: item.content, newContent: null });
			}
			oldCursor += items.length;
			continue;
		}

		// Unchanged run: `items` holds the *new*-side items (diff library convention), so the
		// matching old-side items are read positionally from where the old cursor left off.
		for (let i = 0; i < items.length; i++) {
			const newItem = items[i]!;
			const oldItem = oldItems[oldCursor + i]!;
			lines.push({
				type: "unchanged",
				oldLineNumber: oldItem.lineNumber,
				newLineNumber: newItem.lineNumber,
				oldContent: oldItem.content,
				newContent: newItem.content,
			});
		}
		oldCursor += items.length;
	}

	const hunks: DiffHunk[] = [];
	let hunkStart: number | null = null;

	for (let i = 0; i < lines.length; i++) {
		const isChange = lines[i]!.type !== "unchanged";

		if (isChange && hunkStart === null) {
			hunkStart = i;
		} else if (!isChange && hunkStart !== null) {
			hunks.push({ startIndex: hunkStart, endIndex: i - 1 });
			hunkStart = null;
		}
	}
	if (hunkStart !== null) {
		hunks.push({ startIndex: hunkStart, endIndex: lines.length - 1 });
	}

	const added = lines.filter(line => line.type === "added").length;
	const removed = lines.filter(line => line.type === "removed").length;

	return {
		lines,
		hunks,
		stats: { added, removed, changes: added + removed },
		identical: added === 0 && removed === 0,
	};
}

/** Standard unified-diff text (as produced by `diff -u` / git), suitable for copying or downloading as a .diff file. */
export function generateUnifiedDiffText(
	original: string,
	modified: string,
	options: { originalLabel?: string; modifiedLabel?: string; ignoreWhitespace?: boolean } = {},
): string {
	const { originalLabel = "original", modifiedLabel = "modified", ignoreWhitespace = false } = options;

	return createTwoFilesPatch(originalLabel, modifiedLabel, original, modified, undefined, undefined, {
		ignoreWhitespace,
		context: Number.MAX_SAFE_INTEGER,
	});
}
