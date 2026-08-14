import type { RegexMatch, RegexTestResult } from "./types";

/** Hard ceiling on matches collected, so a pattern matching e.g. every position in a huge string can't hang the tab. */
const MAX_MATCHES = 5000;

function cleanErrorMessage(message: string): string {
	// V8 formats regex syntax errors as "Invalid regular expression: /pattern/: <detail>" — surface just <detail>.
	return message.replace(/^Invalid regular expression:.*?:\s*/, "");
}

function toRegexMatch(match: RegExpMatchArray | RegExpExecArray): RegexMatch {
	const value = match[0] ?? "";

	return {
		index: match.index ?? 0,
		value,
		length: value.length,
		groups: match.groups ? { ...match.groups } : {},
		captures: Array.from(match).slice(1) as Array<string | undefined>,
	};
}

function collectMatches(regex: RegExp, testString: string): { matches: RegExpMatchArray[]; truncated: boolean } {
	if (!regex.global) {
		const match = regex.exec(testString);
		return { matches: match ? [match] : [], truncated: false };
	}

	const matches: RegExpMatchArray[] = [];
	let truncated = false;

	for (const match of testString.matchAll(regex)) {
		if (matches.length >= MAX_MATCHES) {
			truncated = true;
			break;
		}
		matches.push(match);
	}

	return { matches, truncated };
}

export function testRegex(pattern: string, flags: string, testString: string): RegexTestResult {
	if (!pattern) {
		return {
			success: false,
			matches: [],
			matchCount: 0,
			error: "Enter a regular expression to begin testing.",
		};
	}

	let regex: RegExp;

	try {
		regex = new RegExp(pattern, flags);
	} catch (error) {
		return {
			success: false,
			matches: [],
			matchCount: 0,
			error: error instanceof Error ? cleanErrorMessage(error.message) : "This pattern is not a valid regular expression.",
		};
	}

	try {
		const { matches: rawMatches, truncated } = collectMatches(regex, testString);
		const matches = rawMatches.map(toRegexMatch);

		return {
			success: true,
			matches,
			matchCount: matches.length,
			truncated,
		};
	} catch {
		return {
			success: false,
			matches: [],
			matchCount: 0,
			error: "Unable to run this regular expression against the test text.",
		};
	}
}
