const SECTIONS = [
	{
		title: "What this tool checks",
		body: "Beyond formatting and validating JSON, this tool looks for patterns that tend to cause friction for API consumers — missing error details on an error status, inconsistent field types across items in the same collection, mixed naming conventions, and large collections with no pagination metadata. Every finding is informational, not a pass/fail grade.",
	},
	{
		title: "There's no single correct response format",
		body: "Returning a resource directly, wrapping it in a data envelope, or adding a meta object for pagination are all legitimate, widely-used approaches. Which one fits best depends on the endpoint — a single-resource GET has different needs than a paginated list.",
	},
	{
		title: "Why status code and content-type are optional inputs",
		body: "This tool never fetches a live endpoint — the optional HTTP status code, method, and content-type fields are for your own reference and let the analysis cross-check things like whether an error status code has an error-shaped body. Nothing here makes a network request.",
	},
];

export function ApiResponseFormatterSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding API response formatting</h2>

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
