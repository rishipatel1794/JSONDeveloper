import { productConfig } from "@repo/config";

import { Accordion } from "@/components/ui/Accordion";
import { categories } from "@/lib/tools/registry";

/** Exported so the homepage's FAQPage structured data reflects exactly what's rendered here — one source of truth. */
export const HOMEPAGE_FAQ_ITEMS = [
	{
		question: "Are these developer tools free?",
		answer: `Yes. The core tools on ${productConfig.name} are free to use, with no account required.`,
	},
	{
		question: "Do I need to install anything?",
		answer: "No installation needed. Every tool runs in your browser, so you can open a tool and start using it right away.",
	},
	{
		question: "Is my data uploaded?",
		answer:
			"It depends on the tool. Tools that support local processing — most formatters, converters, and generators — run entirely in your browser, so that data never needs to leave your device. The API Client is the exception: it relays your request through a small proxy to actually reach the target server, since browsers can't send arbitrary cross-origin requests directly.",
	},
	{
		question: "Can I use these tools on mobile?",
		answer: "Yes. The site is fully responsive, so you can format JSON or run other tools from a phone or tablet.",
	},
	{
		question: "What developer tools are available?",
		answer: `${categories.length} categories today — JSON, API, Regex, Database, Web, Utilities, and DevOps — covering formatting, validation, conversion, token decoding, request testing, code comparison, and config generation. New tools ship regularly.`,
	},
	{
		question: "Are these tools safe for sensitive data?",
		answer:
			"For tools that process data locally in your browser, yes — nothing is sent anywhere, so it's reasonable to use them with private code or config values. For the API Client, treat it like any HTTP client: the request (including any credentials you put in it) is relayed through our proxy to reach the target server, so avoid sending highly sensitive production secrets through it unless you understand that.",
	},
];

export function FAQ() {
	return (
		<section id="faq" className="scroll-mt-16 border-b border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16 sm:py-20">
				<div className="text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>
				</div>

				<div className="mt-10">
					<Accordion items={HOMEPAGE_FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
