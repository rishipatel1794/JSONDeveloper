import Link from "next/link";

const SECTIONS = [
	{
		title: "Three ways to build a pattern",
		body: "Start from a ready-made template for common formats (email, URL, phone, dates, and more), describe structural requirements like length and required character types, or provide example strings and let the tool infer a starting pattern — then edit the result directly, since no generation mode replaces understanding what the final pattern actually does.",
	},
	{
		title: "Strict vs. practical trade-offs",
		body: "Some templates offer both a stricter pattern (fewer false positives, more false negatives on edge-case-but-valid input) and a looser, practical variant (the reverse trade-off). Neither is universally correct — it depends on whether your use case cares more about rejecting bad input or accepting unusual-but-real input.",
	},
];

export function RegexGeneratorSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Building regular expressions</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Already have a pattern and need to understand it instead? Try the{" "}
					<Link href="/regex-explainer" className="text-primary hover:underline">
						Regex Explainer
					</Link>
					.
				</p>
			</div>
		</section>
	);
}
