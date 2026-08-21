const SECTIONS = [
	{
		title: "What is a Unix timestamp?",
		body: "A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970 — the Unix epoch. It's a compact, timezone-free way to represent a single point in time, which is why it shows up everywhere in logs, databases, and APIs.",
	},
	{
		title: "Unix timestamp in seconds vs milliseconds",
		body: "Most Unix-style systems (databases, cron, many APIs) count in whole seconds, while JavaScript's Date.now() and many web APIs count in milliseconds. A 10-digit number like 1755000000 is almost always seconds; a 13-digit number like 1755000000000 is almost always milliseconds. This tool auto-detects which one you've pasted by digit count.",
	},
	{
		title: "How to convert a Unix timestamp",
		body: "Paste the number into the input above — the tool auto-detects seconds vs. milliseconds and immediately shows the equivalent UTC time, your local time, ISO 8601, and a human-readable relative time (\"3 hours ago\"). Switch the timezone selector to see the same instant in any other region without changing the underlying timestamp.",
	},
	{
		title: "What is ISO 8601?",
		body: "ISO 8601 is an international standard for representing dates and times as text, e.g. 2026-08-12T12:30:00.000Z. The trailing Z means \"UTC\"; an offset like +05:30 means the timestamp is expressed in that zone. Unlike a Unix timestamp, an ISO 8601 string is human-readable and (when it includes an offset or Z) unambiguous about which instant it refers to.",
	},
	{
		title: "Unix timestamp examples",
		body: "0 is the Unix epoch itself (1970-01-01T00:00:00Z). 1755000000 lands in August 2025. Negative values are valid too — they represent an instant before the epoch, e.g. -86400 is exactly one day before 1970-01-01.",
	},
];

export function TimestampSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding Unix timestamps</h2>

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
