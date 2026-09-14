import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "What does a JSON formatter do?",
		answer:
			"It re-indents and adds line breaks to JSON so nested structure is easy to read, without changing any of the actual data — the keys, values, and their types stay exactly the same.",
	},
	{
		question: "Is this JSON formatter free?",
		answer: "Yes, formatting, minifying, validating, and downloading JSON are all free, with no account or sign-up required.",
	},
	{
		question: "Does this tool send my JSON to a server?",
		answer: "No. Everything runs locally in your browser — your JSON is never uploaded, which makes it safe to use with private data.",
	},
	{
		question: "Why is my JSON invalid?",
		answer:
			"The most common causes are a trailing comma after the last property or element, single quotes instead of double quotes, and a missing comma between two properties. Click Validate to see the specific reason for your input.",
	},
	{
		question: "What's the difference between formatting and minifying JSON?",
		answer:
			"Formatting adds indentation and line breaks for readability. Minifying removes all non-essential whitespace to make the payload as small as possible for storage or network transfer. Both preserve the same underlying data.",
	},
	{
		question: "Can I download the formatted JSON?",
		answer: "Yes — after formatting, click Download to save the result as a .json file, or Copy to copy it to your clipboard.",
	},
];

export function JsonFormatterFaq() {
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
