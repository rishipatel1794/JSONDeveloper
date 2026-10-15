const PATTERNS = [
	{
		title: "Resource representation",
		description: "Returns the resource directly at the root — simple, and common for single-resource endpoints.",
		example: { id: 123, name: "Example User", email: "user@example.com" },
	},
	{
		title: "Envelope-based",
		description: "Wraps the resource in a `data` field, leaving room to add top-level metadata later without breaking clients.",
		example: { data: { id: 123, name: "Example User" } },
	},
	{
		title: "Collection with pagination",
		description: "An array of items under `data`, with a `meta` object describing the page the client is looking at.",
		example: { data: [{ id: 1, name: "User One" }, { id: 2, name: "User Two" }], meta: { page: 1, perPage: 10, total: 100 } },
	},
];

/**
 * A static reference, not derived from the user's input — this tool never reshapes what was pasted in.
 * All three patterns are valid; which one fits depends on the endpoint, not a universal rule.
 */
export function ResponsePatternsReference() {
	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				For reference only — these are common, valid response shapes, not a required format. Your input above is never modified.
			</p>
			<div className="grid gap-3 md:grid-cols-3">
				{PATTERNS.map(pattern => (
					<div key={pattern.title} className="rounded-lg border border-border bg-card p-3">
						<p className="text-sm font-semibold text-foreground">{pattern.title}</p>
						<p className="mt-1 text-xs text-muted-foreground">{pattern.description}</p>
						<pre className="mt-2 overflow-x-auto rounded-md bg-secondary p-2 font-mono text-[11px] text-foreground">
							{JSON.stringify(pattern.example, null, 2)}
						</pre>
					</div>
				))}
			</div>
		</div>
	);
}
