import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "Is my JSON uploaded anywhere?",
		answer: "No — parsing, formatting, and every visualization (tree, table, graph) run entirely in your browser. Nothing is sent to a server.",
	},
	{
		question: "What happens with very large JSON files?",
		answer: "Inputs larger than 10MB are rejected with a clear message rather than freezing the tab. Within that limit, the tree and graph views cap the number of rendered nodes for performance — collapse branches or use search to narrow in on what you need.",
	},
	{
		question: "Why does the graph view limit how many nodes it draws?",
		answer: "Rendering an unbounded number of DOM nodes can make the browser tab unresponsive. The graph caps itself at a safe node count and tells you when it's truncated — collapsing branches or increasing the depth limit lets you explore more of a large document at a time.",
	},
	{
		question: "Can I get the graph out of the browser?",
		answer: "Yes — export it as an SVG (vector, editable), a PNG (raster image), or a Mermaid diagram definition you can paste into any Mermaid-compatible renderer or documentation tool.",
	},
	{
		question: "Does the graph work the same with reduced-motion settings?",
		answer: "Yes — if your system has \"reduce motion\" enabled, the animated flow along connections is automatically disabled while everything else stays fully functional.",
	},
];

export function JsonVisualizerFaq() {
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
