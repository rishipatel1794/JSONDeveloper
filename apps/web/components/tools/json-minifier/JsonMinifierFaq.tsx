import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "What does a JSON minifier do?",
		answer: "It removes all non-essential whitespace — spaces, tabs, and line breaks — from JSON, producing the smallest possible text that still parses to the exact same data.",
	},
	{
		question: "Is minified JSON still valid JSON?",
		answer: "Yes. Whitespace between tokens is not significant in JSON, so removing it doesn't change the data or make it invalid.",
	},
	{
		question: "Does this tool upload my JSON anywhere?",
		answer: "No — minification happens entirely in your browser. Your JSON is never sent to a server.",
	},
	{
		question: "How much smaller does minifying make my JSON?",
		answer: "It depends on how much whitespace and indentation the original had. Heavily indented JSON with deep nesting typically shrinks by 15-30%; the exact reduction percentage is shown after you minify.",
	},
	{
		question: "Can I convert minified JSON back to readable JSON?",
		answer: "Yes — paste the minified JSON into the JSON Formatter to pretty-print it back into an indented, readable form.",
	},
];

export function JsonMinifierFaq() {
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
