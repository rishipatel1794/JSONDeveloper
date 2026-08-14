const SECTIONS = [
	{
		title: "What is a Regex Tester?",
		body: "A regex tester lets you write a regular expression, run it against sample text, and immediately see what it matches — without writing and re-running code every time you tweak the pattern.",
	},
	{
		title: "How to test a regular expression",
		body: "Enter a pattern, choose the flags you need, paste in some test text, and click Test Regex (or press Ctrl/Cmd + Enter). Matches are highlighted in the text, and each one is broken down below with its index, length, and any capture groups.",
	},
	{
		title: "Common regex flags",
		body: "Flags change how a pattern is applied. The most common are g (global), i (case insensitive), and m (multiline); s (dot all), u (unicode), and y (sticky) cover more specialized cases.",
	},
	{
		title: "What does the g flag mean?",
		body: "Without g, a regex stops after its first match. With g, it keeps scanning and returns every match in the text — which is what most people expect from a \"find all\" tool.",
	},
	{
		title: "What does the i flag mean?",
		body: "i makes matching case-insensitive, so a pattern like hello also matches Hello and HELLO.",
	},
	{
		title: "What are capture groups?",
		body: "Parentheses in a pattern, like (\\w+), create a capture group — a portion of the match you can reference separately. A pattern can have multiple numbered groups, accessed in order (Group 1, Group 2, ...).",
	},
	{
		title: "What are named capture groups?",
		body: "Writing (?<name>...) instead of (...) gives a group a name instead of just a number, making results easier to read — for example (?<username>\\w+)@(?<domain>[\\w.]+) labels its two groups username and domain.",
	},
	{
		title: "Regex examples",
		body: "The Load Example menu includes patterns for email addresses, URLs, phone numbers, numbers, whitespace, hashtags, mentions, and IPv4 addresses — useful starting points, though none should be treated as a universally perfect validator.",
	},
	{
		title: "Common regex mistakes",
		body: "Forgetting the g flag when you expect multiple matches, forgetting to escape special characters like . or +, and writing patterns that are more permissive (or more restrictive) than intended are some of the most frequent issues. Testing against real sample data, including edge cases, helps catch these early.",
	},
];

export function RegexSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding regular expressions</h2>

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
