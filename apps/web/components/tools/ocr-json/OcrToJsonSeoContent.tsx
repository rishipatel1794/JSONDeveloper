const SECTIONS = [
	{
		title: "What does this tool convert?",
		body: "Document-parsing OCR tools (PaddleOCR and similar) often return recognized text as \"markdown\" — but it's usually just OCR'd text blocks in reading order, separated by blank lines, not real Markdown syntax. This tool turns that into structured JSON: a table of key/value pairs for label-style content, and a separate list for anything that doesn't look like a label or value.",
	},
	{
		title: "How the label/value extraction works",
		body: "The response is split into blocks on blank lines. A block that ends in a colon (like \"Operator:\") is treated as a label, and the next block becomes its value. A label and value on the same line (\"Test gas: AIR\") are split directly. A label with nothing after it before the next label starts — common when OCR finds no text under a field — gets an empty value instead of being skipped.",
	},
	{
		title: "Why some text ends up \"unlabeled\"",
		body: "Real OCR output isn't always in perfect reading order — a page number or stray fragment can get attached to the wrong block. Rather than guess which field a fragment belongs to (or silently drop it), anything that doesn't clearly pair as a label or a value is kept in a separate unlabeled list, so you can see exactly what OCR produced and reconcile it yourself.",
	},
	{
		title: "Does this run actual OCR on an image?",
		body: "No — this tool doesn't perform OCR itself. It expects a response you already got from an OCR/document-parsing tool (PaddleOCR, or similar), and restructures that into JSON. If you paste the raw OCR'd text with no wrapping JSON, that works too.",
	},
	{
		title: "Is my document data uploaded anywhere?",
		body: "No. Parsing happens entirely in your browser — the OCR response and the resulting JSON never leave your device, which matters for scanned forms, reports, or other documents that may contain sensitive data.",
	},
];

export function OcrToJsonSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding OCR to JSON conversion</h2>

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
