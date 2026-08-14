import type { RegexExample, RegexMatch } from "./types";

/** Above this many characters, warn the user before running (potentially expensive) regex processing. */
export const LARGE_INPUT_WARNING_LENGTH = 50_000;

/** Cap the number of match detail cards rendered, so a pathological pattern can't produce thousands of DOM nodes. */
export const MAX_DETAILED_MATCHES = 100;

/** Above this many matches, skip inline highlighting and point to Match Details instead. */
export const MAX_HIGHLIGHT_MATCHES = 500;

export const REGEX_EXAMPLES: RegexExample[] = [
	{
		name: "Email",
		pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
		flags: "gm",
		sampleText: "john@example.com\ninvalid@email\ndeveloper@example.org",
	},
	{
		name: "URL",
		pattern: "https?://[^\\s]+",
		flags: "g",
		sampleText: "Visit https://example.com or http://dev.example.org/path for more.",
	},
	{
		name: "Phone Number",
		pattern: "\\+?[0-9][0-9\\-\\s]{7,14}[0-9]",
		flags: "g",
		sampleText: "Call +1 555-123-4567 or +44 20 7946 0958.",
	},
	{
		name: "Numbers",
		pattern: "\\d+",
		flags: "g",
		sampleText: "Order #4521 shipped 3 items on 2026-08-12.",
	},
	{
		name: "Whitespace",
		pattern: "\\s+",
		flags: "g",
		sampleText: "This   text has\tirregular    spacing.",
	},
	{
		name: "Hashtags",
		pattern: "#[\\w]+",
		flags: "g",
		sampleText: "Loving the new #devtools release! #javascript #webdev",
	},
	{
		name: "Mentions",
		pattern: "@[\\w]+",
		flags: "g",
		sampleText: "Thanks @johndoe and @jane_smith for the review!",
	},
	{
		name: "IPv4 Address",
		pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
		flags: "g",
		sampleText: "Server at 192.168.1.1 responded; backup is 10.0.0.254.",
	},
	{
		name: "Named groups",
		pattern: "(?<username>\\w+)@(?<domain>[\\w.]+)",
		flags: "g",
		sampleText: "Contact john@example.com or jane@example.org.",
	},
];

interface HighlightSegment {
	text: string;
	matched: boolean;
}

/** Splits text into matched/unmatched segments for highlighting. Assumes non-overlapping, index-sorted matches. */
export function buildHighlightSegments(text: string, matches: RegexMatch[]): HighlightSegment[] {
	if (matches.length === 0) return [{ text, matched: false }];

	const segments: HighlightSegment[] = [];
	let cursor = 0;

	for (const match of matches) {
		if (match.index > cursor) {
			segments.push({ text: text.slice(cursor, match.index), matched: false });
		}

		const end = match.index + match.length;
		segments.push({ text: text.slice(match.index, end), matched: true });
		cursor = Math.max(cursor, end);
	}

	if (cursor < text.length) {
		segments.push({ text: text.slice(cursor), matched: false });
	}

	return segments;
}
