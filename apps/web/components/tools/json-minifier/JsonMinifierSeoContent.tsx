import Link from "next/link";

const SECTIONS = [
	{
		title: "What is JSON minification?",
		body: "JSON minification removes every character that isn't required to parse the data — spaces, tabs, and line breaks between tokens — without changing the data itself. The result parses to the exact same value as the original, just in fewer bytes.",
	},
	{
		title: "Why minify JSON?",
		body: "Smaller JSON transfers faster over the network and takes up less space in storage or a database column. For API responses served many times, even a modest size reduction adds up across total bandwidth. It's purely a size optimization — it doesn't change what the data means.",
	},
	{
		title: "How to minify JSON online",
		body: "Paste your JSON into the input above. The minified result appears instantly in the output panel, along with the size reduction percentage. Copy it or download it as a .json file.",
	},
	{
		title: "Does minifying JSON lose any data?",
		body: "No. Minification only strips insignificant whitespace — it never removes or alters keys, values, or structure. Parsing the minified output gives you back an identical object to parsing the original.",
	},
	{
		title: "Minify vs. gzip compression",
		body: "Minification and gzip solve different problems and are often used together. Minifying removes whitespace at the JSON-text level; gzip is a general-purpose compression applied by the server/CDN on top of that. Minifying first still helps, since gzip works on the already-smaller minified text.",
	},
];

export function JsonMinifierSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding JSON minification</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Need to go the other way and make minified JSON readable again? Use the{" "}
					<Link href="/json-formatter" className="text-primary hover:underline">
						JSON Formatter
					</Link>{" "}
					to pretty-print it.
				</p>
			</div>
		</section>
	);
}
