export interface RegexMatch {
	index: number;
	value: string;
	length: number;
	groups: Record<string, string | undefined>;
	captures: Array<string | undefined>;
}

export interface RegexTestResult {
	success: boolean;
	matches: RegexMatch[];
	matchCount: number;
	truncated?: boolean;
	error?: string;
}

export interface RegexFlagDefinition {
	flag: string;
	label: string;
	description: string;
}

export const REGEX_FLAGS: RegexFlagDefinition[] = [
	{ flag: "g", label: "Global", description: "Find all matches instead of stopping after the first." },
	{ flag: "i", label: "Case insensitive", description: "Match regardless of letter case." },
	{ flag: "m", label: "Multiline", description: "^ and $ match the start and end of each line." },
	{ flag: "s", label: "Dot all", description: "Let . match newline characters too." },
	{ flag: "u", label: "Unicode", description: "Treat the pattern as a sequence of Unicode code points." },
	{ flag: "y", label: "Sticky", description: "Match only starting from the current position." },
];

export interface RegexExample {
	name: string;
	pattern: string;
	flags: string;
	sampleText: string;
}
