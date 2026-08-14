import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What is a regular expression?",
		answer:
			"A regular expression (regex) is a pattern used to match, search, or replace text based on rules rather than exact strings.",
	},
	{
		question: "How do I test a regex?",
		answer:
			"Enter your pattern and flags, paste in sample text, and click Test Regex (or press Ctrl/Cmd + Enter). Matches are highlighted, with details for each one below.",
	},
	{
		question: "What does the g flag do?",
		answer: "g (global) finds every match in the text instead of stopping after the first one.",
	},
	{
		question: "What does the i flag do?",
		answer: "i (case insensitive) makes the pattern match regardless of upper or lower case.",
	},
	{
		question: "What are capture groups?",
		answer:
			"Parentheses in a pattern create capture groups — parts of a match you can reference individually, either by number or, with (?<name>...), by name.",
	},
	{
		question: "Does this Regex Tester send my data to a server?",
		answer:
			"No. Your pattern and test text are processed entirely in your browser using JavaScript's built-in regex engine — nothing is sent to our backend.",
	},
	{
		question: "Why does my regular expression fail?",
		answer:
			"Common causes include unescaped special characters (., *, +, ?, (, ), [, ]), a missing g flag when you expected multiple matches, or a pattern that's stricter (or looser) than the text you're testing against. The error message and match details below can help pinpoint the issue.",
	},
];

export function RegexFaq() {
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
