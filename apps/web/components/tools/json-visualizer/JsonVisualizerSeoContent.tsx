const SECTIONS = [
	{
		title: "Five ways to look at the same JSON",
		body: "Raw and Formatted show the text itself, unmodified and pretty-printed respectively. Tree gives a familiar collapsible outline. Table turns an array of similarly-shaped objects into spreadsheet-style rows and columns. Graph renders the same structure as connected nodes — often the fastest way to spot how deeply something is nested or how many items a collection actually holds.",
	},
	{
		title: "When the graph view helps most",
		body: "A deeply nested API response or configuration file can be hard to scan as indented text. Seeing it as a node graph — with objects, arrays, and primitive values visually distinct, and edges showing exactly which value belongs to which key — makes the overall shape obvious at a glance, especially once you collapse the branches you don't need right now.",
	},
];

export function JsonVisualizerSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Visualizing JSON structure</h2>
				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
