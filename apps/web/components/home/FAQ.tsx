import { productConfig } from "@repo/config";

import { Accordion } from "@/components/ui/Accordion";

export function FAQ() {
	const items = [
		{
			question: "Are these developer tools free?",
			answer: `Yes. The core tools on ${productConfig.name} — like the JSON Formatter — are free to use, with no account required.`,
		},
		{
			question: "Do I need to install anything?",
			answer: "No installation needed. Every tool runs in your browser, so you can open a tool and start using it right away.",
		},
		{
			question: "Is my data uploaded?",
			answer:
				"Tools that support local processing run directly in your browser, so that data doesn't need to leave your device to produce a result.",
		},
		{
			question: "Can I use these tools on mobile?",
			answer: "Yes. The site is fully responsive, so you can format JSON or run other tools from a phone or tablet.",
		},
		{
			question: "What developer tools are available?",
			answer:
				"We're building out JSON, API, Regex, Database, Web, Utilities, and DevOps categories. The JSON Formatter is live today, with more tools shipping regularly.",
		},
	];

	return (
		<section id="faq" className="scroll-mt-16 border-b border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16 sm:py-20">
				<div className="text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>
				</div>

				<div className="mt-10">
					<Accordion items={items} />
				</div>
			</div>
		</section>
	);
}
