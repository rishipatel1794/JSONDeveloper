import Link from "next/link";

const SECTIONS = [
	{
		title: "What a regular expression is",
		body: "A regular expression (regex) is a pattern that describes a set of strings — used to test whether text matches a shape, find occurrences within it, or extract specific pieces of it. It's a small, dense language of its own, which is exactly why unfamiliar patterns can be hard to read at a glance.",
	},
	{
		title: "Character classes",
		body: "A character class like [a-z] or [^0-9] matches exactly one character from (or, negated, not from) a defined set. Shorthand classes exist for common sets: \\d for digits, \\w for word characters, \\s for whitespace, each with an uppercase negated form (\\D, \\W, \\S).",
	},
	{
		title: "Quantifiers",
		body: "A quantifier controls how many times the preceding element can repeat: * (zero or more), + (one or more), ? (zero or one), and {m,n} for an exact range. Each has a greedy form (matches as much as possible) and a lazy form with a trailing ? (matches as little as possible).",
	},
	{
		title: "Capturing vs. non-capturing groups",
		body: "(abc) is a capturing group — its match is remembered and can be referenced later (by index, or by name with (?<name>abc)) or extracted from match results. (?:abc) is a non-capturing group — it groups for the purpose of quantifying or alternation without the overhead of remembering the match.",
	},
	{
		title: "Anchors and boundaries",
		body: "^ and $ anchor a match to the start and end of the input (or of each line, with the m flag). \\b matches a word boundary — the transition between a word character and a non-word character — without consuming any characters itself.",
	},
	{
		title: "Greedy vs. lazy matching",
		body: "Given <a><b>, a greedy <.+> matches the entire string (it grabs as much as possible, then backtracks only if needed), while a lazy <.+?> matches just <a> (it grabs as little as possible, extending only when forced to).",
	},
	{
		title: "Lookaheads and lookbehinds",
		body: "(?=...) and (?!...) check what follows the current position without consuming it; (?<=...) and (?<!...) do the same for what precedes it. They're how a pattern can require (or forbid) nearby context without including that context in the actual match.",
	},
	{
		title: "Regex flags",
		body: "Flags change how the whole pattern behaves: g finds every match instead of stopping at the first, i ignores case, m makes ^/$ match per line, s lets . match newlines, and u treats the pattern as Unicode code points rather than UTF-16 code units.",
	},
	{
		title: "Common mistakes",
		body: "Forgetting to escape a literal . or other special character, using greedy quantifiers where lazy ones were intended, assuming a pattern is anchored when it isn't (so it matches as a substring anywhere), and nesting quantifiers in a way that causes catastrophic backtracking.",
	},
	{
		title: "Differences between regex engines",
		body: "JavaScript, Python, PHP (PCRE), and Java mostly agree on core syntax, but differ on specifics — lookbehind support history, named-group syntax, Unicode property escape support, and some default behaviors. A pattern that works in one engine isn't guaranteed to work unmodified in another.",
	},
];

export function RegexExplainerSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding regular expressions</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Need to build a pattern instead of explain one? Try the{" "}
					<Link href="/regex-generator" className="text-primary hover:underline">
						Regex Generator
					</Link>
					.
				</p>
			</div>
		</section>
	);
}
