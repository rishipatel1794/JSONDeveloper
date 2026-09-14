import Link from "next/link";

const SECTIONS = [
	{
		title: "What is JSON formatting?",
		body: "JSON formatting (also called \"beautifying\" or \"pretty-printing\") takes compact or inconsistently-indented JSON and re-outputs it with consistent line breaks and indentation, so nested objects and arrays are easy to read. The underlying data is unchanged — only the whitespace around it changes.",
	},
	{
		title: "How to format JSON online",
		body: "Paste or type your JSON into the Input editor above, then click Format. The formatted result appears in the Output panel with 2-space indentation, ready to copy or download. If the input isn't valid JSON, an error explains exactly what's wrong instead of silently failing.",
	},
	{
		title: "Format vs. minify vs. validate",
		body: "Format expands JSON for readability. Minify does the opposite — it strips all non-essential whitespace to produce the smallest possible payload, which is useful before sending JSON over a network or storing it. Validate checks that the JSON is syntactically correct without changing it at all. This tool does all three from the same input.",
	},
	{
		title: "Why format JSON before committing or sharing it?",
		body: "Minified or inconsistently-indented JSON is hard to review in a diff or a code review — a single-line JSON blob shows as one giant changed line even if only one value changed. Formatting it first means version control and reviewers can see exactly which keys or values actually changed.",
	},
	{
		title: "Common JSON formatting issues",
		body: "The most common reasons formatting fails are a trailing comma after the last property or array element, single quotes instead of double quotes around keys and strings, and an unquoted key. These are all valid in JavaScript object literals but not in standard JSON, which trips people up when copying data out of JavaScript source code.",
	},
	{
		title: "Is my JSON data uploaded anywhere?",
		body: "No. Formatting, minifying, and validating all run locally in your browser using the JavaScript JSON parser — nothing is sent to a server, so it's safe to use with private configuration files, API responses, or other sensitive data.",
	},
];

export function JsonFormatterSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding JSON formatting</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Need to debug why JSON does not parse, detect duplicate keys, or validate against a JSON Schema? Use the{" "}
					<Link href="/json-validator" className="text-primary hover:underline">
						JSON Validator
					</Link>{" "}
					for deeper analysis instead.
				</p>
			</div>
		</section>
	);
}
