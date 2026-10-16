import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "Does this explainer use the same engine as the matching results?",
		answer: "Yes for matching — it uses your browser's native JavaScript RegExp engine. The explanation itself is built from a separate, dedicated parser that produces a full syntax tree, so the breakdown reflects the pattern's actual structure rather than a guess from scanning the text.",
	},
	{
		question: "Why does the explanation differ from what I remember from Python or PCRE?",
		answer: "Regex engines agree on most syntax but differ on some details — named group syntax, lookbehind support, Unicode property escapes, and a few edge cases vary between JavaScript, Python's re, PHP's PCRE, and Java's engine. This tool explains JavaScript-compatible syntax specifically and calls out where behavior is JavaScript-specific.",
	},
	{
		question: "What happens if I paste an invalid pattern?",
		answer: "You'll get a clear parse error naming the problem (unmatched parenthesis, invalid quantifier range, etc.) instead of a crash or a misleading partial explanation.",
	},
	{
		question: "Is matching here safe against a pattern with catastrophic backtracking?",
		answer: "Matching runs inside an isolated Web Worker with a hard 1-second timeout — if a pattern hangs, the worker is forcibly terminated rather than freezing the page. A static check also flags common risky shapes (like nested quantifiers) before you even run it.",
	},
];

export function RegexExplainerFaq() {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>
				<div className="mt-8">
					<Accordion items={FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
