import Link from "next/link";

const SECTIONS = [
	{
		title: "What is a cron expression?",
		body: "A cron expression is a compact, five-field string that tells a scheduler exactly when to run a job — for example a backup script, a report email, or a cache-clearing task. It originates from the Unix cron daemon, and the same five-field format is understood by cron itself, most CI/CD schedulers, and countless job-queue libraries.",
	},
	{
		title: "Cron syntax explained",
		body: "Each expression has five space-separated fields, in order: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-7, where both 0 and 7 mean Sunday). Each field accepts a literal number, an asterisk (*) meaning \"every value\", a range like 1-5, a step like */15, a comma list like 1,15, or a combination like 1-5/2.",
	},
	{
		title: "Cron examples",
		body: "*/5 * * * * runs every 5 minutes. 0 9 * * * runs once a day at 9:00 AM. 0 9 * * 1-5 runs at 9:00 AM on weekdays only. 0 0 1 * * runs at midnight on the 1st of every month. 0 0 * * 0 runs at midnight every Sunday.",
	},
	{
		title: "How to create a cron job",
		body: "Build the expression above using the presets or the field-by-field builder, copy it, then add it to your scheduler. On a Linux server that's typically crontab -e, followed by a line like 0 9 * * 1-5 /path/to/script.sh. In most CI/CD platforms and job schedulers, the same five-field expression goes directly into a \"schedule\" field.",
	},
	{
		title: "Common cron schedules",
		body: "The most frequently used schedules are: every minute (* * * * *) for aggressive polling, every 5/15/30 minutes for periodic sync jobs, once daily at a fixed time for backups and reports, weekdays-only at a fixed time for business-hours jobs, and monthly-on-the-1st for billing or cleanup jobs.",
	},
	{
		title: "Cron expression format",
		body: "Standard cron uses exactly 5 fields (minute hour day-of-month month day-of-week) — this is what this tool and most Unix cron implementations expect. Some schedulers (like some CI systems) add a 6th seconds field at the front, and others support named shortcuts like @daily or @hourly; those aren't part of standard 5-field cron and aren't generated here.",
	},
	{
		title: "Cron vs systemd timers",
		body: "systemd timers are a newer alternative to cron on Linux systems that use systemd — they support cron-style calendar expressions too, but also offer monotonic timers (\"5 minutes after boot\"), better logging via journalctl, and dependency management between units. Cron remains simpler to reason about and is universally available, which is why it's still the default choice for most straightforward scheduled tasks.",
	},
];

export function CronGeneratorSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding cron expressions</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Already have an expression and want it explained instead of built? Use the{" "}
					<Link href="/tools/cron-parser" className="text-primary hover:underline">
						Cron Parser
					</Link>{" "}
					to see exactly what it does, field by field.
				</p>
			</div>
		</section>
	);
}
