import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "Does every API response need a success, message, and data field?",
		answer:
			"No. That's one common convention, but plenty of well-designed APIs return the resource directly at the root, or use other envelope styles. This tool analyzes what's actually there rather than assuming one structure is mandatory.",
	},
	{
		question: "Why didn't it flag my response even though it doesn't use a `data` wrapper?",
		answer: "Because that's a valid, common pattern — returning the resource representation directly. Findings here are contextual observations, not a checklist every response must pass.",
	},
	{
		question: "Is my pasted response data uploaded anywhere?",
		answer: "No — parsing, formatting, and analysis all run locally in your browser. Nothing is sent to a server or logged.",
	},
	{
		question: "What counts as 'excessive nesting'?",
		answer: "This tool flags responses nested more than 7 levels deep as worth a second look — not necessarily wrong, but often a sign the shape could be flattened for easier client-side handling.",
	},
	{
		question: "Why does it flag mixed naming conventions?",
		answer: "Mixing camelCase and snake_case field names within the same response forces every client to remember which fields use which style. Picking one convention consistently is a small change that meaningfully improves developer experience.",
	},
];

export function ApiResponseFormatterFaq() {
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
