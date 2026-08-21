const SECTIONS = [
	{
		title: "What is JSON validation?",
		body: "JSON validation checks whether a document follows the JSON grammar — matched brackets, double-quoted keys and strings, correctly separated properties, and valid literals. A syntactically valid document can still be poorly structured, which is why this tool goes further and analyzes the parsed structure once it validates.",
	},
	{
		title: "How to validate JSON",
		body: "Paste or type JSON into the editor above. Validation runs automatically as you type (after a short debounce) and also on demand via the Validate button. Valid input immediately shows statistics, a structure tree, and generation options; invalid input shows exactly where and why parsing failed.",
	},
	{
		title: "Common JSON syntax errors",
		body: "The most frequent mistakes are a trailing comma after the last property or array element, single quotes instead of double quotes around keys and strings, and a missing comma between two properties. Each of these is detected specifically here, with a plain-English explanation rather than a generic parser error.",
	},
	{
		title: "What are duplicate JSON keys?",
		body: "JSON technically allows the same key to appear more than once in an object, but doing so is almost always a mistake — most parsers (including JavaScript's) silently keep only the last occurrence and discard the rest. This tool scans for duplicate keys separately from parsing, so you can catch them before they cause a silent bug.",
	},
	{
		title: "JSON vs JSON Schema",
		body: "JSON is a data format; JSON Schema is a separate JSON document that describes the shape a JSON document should have — which properties are required, what type each value must be, and more. Validating JSON just checks syntax; validating against a JSON Schema checks that the data actually matches an expected contract.",
	},
	{
		title: "How to validate JSON against a schema",
		body: "Switch to the JSON Schema tab, paste a schema document, and validation runs automatically against the JSON in the input above. Each failure reports the exact property path along with what the schema expected versus what was actually found.",
	},
	{
		title: "JSON validation examples",
		body: 'A trailing comma like {"name": "Rishi",} is invalid. Single quotes like {\'name\': \'Rishi\'} are invalid. A missing comma between {"name": "Rishi" "age": 25} is invalid. All three are common when hand-editing JSON or converting from another language\'s object literal syntax.',
	},
];

export function JsonValidatorSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding JSON validation</h2>

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
