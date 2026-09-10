import Link from "next/link";

const BREAKDOWN_DIAGRAM = `┌──────────── minute (0-59)
│ ┌────────── hour (0-23)
│ │ ┌──────── day of month (1-31)
│ │ │ ┌────── month (1-12)
│ │ │ │ ┌──── day of week (0-7, Sun=0 or 7)
│ │ │ │ │
* * * * *`;

const SECTIONS = [
	{
		title: "How to read a cron expression",
		body: "A cron expression has five fields in a fixed order: minute, hour, day of month, month, and day of week. Reading left to right tells you exactly when a job fires — this tool expands each field into plain English so you don't have to mentally decode the syntax every time you see one in a codebase.",
	},
	{
		title: "Field positions",
		body: "",
	},
	{
		title: "Cron dialect limitations",
		body: "This parser supports standard 5-field cron syntax, which covers the vast majority of crontab files, CI/CD schedule fields, and job schedulers. It does not interpret non-standard extensions some tools add: a leading seconds field (6 fields total), named shortcuts like @daily or @reboot, or the L/W/# special characters some enterprise schedulers (like Quartz) support. If your expression comes from one of those dialects, check that tool's own documentation.",
	},
];

export function CronParserSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding cron field positions</h2>

				<div className="mt-6 space-y-6">
					<div>
						<h3 className="text-base font-semibold text-foreground">{SECTIONS[0]!.title}</h3>
						<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{SECTIONS[0]!.body}</p>
					</div>

					<div>
						<h3 className="text-base font-semibold text-foreground">Field positions</h3>
						<pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-secondary p-4 font-mono text-xs leading-relaxed text-muted-foreground">
							{BREAKDOWN_DIAGRAM}
						</pre>
					</div>

					<div>
						<h3 className="text-base font-semibold text-foreground">{SECTIONS[2]!.title}</h3>
						<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{SECTIONS[2]!.body}</p>
					</div>
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Need to build a new schedule instead of decoding an existing one? Try the{" "}
					<Link href="/tools/cron-generator" className="text-primary hover:underline">
						Cron Generator
					</Link>
					.
				</p>
			</div>
		</section>
	);
}
