import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "Can a generated pattern guarantee my input is fully valid?",
		answer:
			"No single regex can guarantee complete validation of a complex real-world format like an email address or phone number — these templates check the general shape, not deliverability or existence. Each template lists exactly what it doesn't guarantee.",
	},
	{
		question: "How reliable is the \"generate from examples\" mode?",
		answer:
			"It's a heuristic, not a guarantee — it generalizes based on the character type at each position across your examples. More examples that vary in realistic ways produce a more reliable result. When examples don't share a consistent length or shape, it falls back to matching only the exact examples you gave.",
	},
	{
		question: "Is it safe to test an untrusted or unfamiliar regex pattern here?",
		answer:
			"Matching runs in an isolated Web Worker with a hard 1-second timeout, so a pattern with catastrophic backtracking gets forcibly stopped instead of freezing the page. A static check also warns about common risky shapes before you even run it.",
	},
	{
		question: "Why do the JavaScript, Python, PHP, and Java snippets sometimes include a warning?",
		answer:
			"Not every regex flag has an equivalent in every language — JavaScript's \"g\" (global) and \"y\" (sticky) flags, for instance, don't map to a compile-time flag in Python, PHP, or Java. Those snippets explain the actual equivalent approach instead of silently dropping the behavior.",
	},
];

export function RegexGeneratorFaq() {
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
