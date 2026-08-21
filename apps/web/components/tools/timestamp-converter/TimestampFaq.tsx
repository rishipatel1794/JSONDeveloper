import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What is a Unix timestamp?",
		answer:
			"It's the number of seconds (or milliseconds) since January 1, 1970 00:00:00 UTC. It represents one exact instant in time without needing a timezone.",
	},
	{
		question: "What is the difference between Unix seconds and milliseconds?",
		answer:
			"Seconds and milliseconds both count from the same epoch, but milliseconds count 1,000x faster. A 10-digit number is typically seconds; a 13-digit number is typically milliseconds. This tool detects which one you've entered automatically.",
	},
	{
		question: "How do I convert Unix time to ISO 8601?",
		answer:
			"Paste your Unix timestamp into the input above — the ISO 8601 row in the results shows the equivalent value instantly, e.g. 2026-08-12T12:30:00.000Z.",
	},
	{
		question: "How do I get the current Unix timestamp?",
		answer: "Click the \"Now\" button next to the input, or use the live clock's \"Use this moment\" button — both fill in the current time immediately.",
	},
	{
		question: "How do I convert a date to Unix time?",
		answer:
			"Switch to the \"Date → Timestamp\" tab, enter a date, time, and timezone, and the Unix seconds/milliseconds appear in the results panel.",
	},
	{
		question: "Why is my timestamp showing the wrong timezone?",
		answer:
			"The \"Local\" result always reflects the timezone selected in the timezone dropdown, which defaults to your browser's detected timezone. Change the selector to see the same instant in any other zone — the underlying timestamp never changes.",
	},
];

export function TimestampFaq() {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>

				<div className="mt-8">
					<Accordion items={FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
