import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What does an asterisk (*) mean in cron?",
		answer: "It means \"every value is valid for this field\" — for example * in the hour field means the job can run in any hour, subject to whatever the minute field restricts it to.",
	},
	{
		question: "What's the difference between */5 and 0,5,10,15...?",
		answer: "They're equivalent for a field starting at its minimum — */5 in the minute field means \"every 5th minute starting from 0\", i.e. 0, 5, 10, 15, and so on. The step syntax is just shorter and less error-prone to type.",
	},
	{
		question: "How do I run a job on both the 1st and 15th of the month?",
		answer: "Use a comma list in the day-of-month field: 0 0 1,15 * * runs at midnight on the 1st and the 15th of every month.",
	},
	{
		question: "What happens if I restrict both day-of-month and day-of-week?",
		answer: "Standard cron treats them as OR, not AND — the job runs when either condition is true. For example 0 0 1 * 5 runs on the 1st of the month AND on every Friday, not only on a Friday that happens to be the 1st. If you only mean one of them, leave the other as *.",
	},
	{
		question: "Does 0 and 7 both mean Sunday in the day-of-week field?",
		answer: "Yes — this is standard cron behavior. Both 0 and 7 refer to Sunday, so 0 9 * * 0 and 0 9 * * 7 are identical schedules.",
	},
	{
		question: "Can I schedule something more frequently than every minute?",
		answer: "No — standard 5-field cron has minute-level granularity as its finest resolution. For sub-minute scheduling you'd need application-level logic (e.g. a loop with a sleep) rather than cron itself.",
	},
];

export function CronGeneratorFaq() {
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
