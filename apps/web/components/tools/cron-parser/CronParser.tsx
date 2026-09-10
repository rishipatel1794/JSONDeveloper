"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ListChecks, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { ToolToolbar } from "@/components/tools/shared/ToolToolbar";
import { FIELD_LABELS } from "@/lib/tools/cron/fields";
import { parseCronString } from "@/lib/tools/cron/format";
import { describeCronExpression, describeFields } from "@/lib/tools/cron/describe";
import { EXAMPLE_CRON_EXPRESSIONS, getNextRunTimes } from "@/lib/tools/cron/parser";

const DEFAULT_INPUT = "*/15 9-17 * * 1-5";

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
	weekday: "short",
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

export function CronParser() {
	const [input, setInput] = useState(DEFAULT_INPUT);

	const result = useMemo(() => parseCronString(input), [input]);
	const explanation = useMemo(() => (result.valid && result.expression ? describeCronExpression(result.expression) : null), [result]);
	const fields = useMemo(() => (result.valid && result.expression ? describeFields(result.expression) : []), [result]);

	// "Next run times" depends on the current moment and the browser's locale — computing it during
	// the initial render would render differently on the server than the client and fail to hydrate,
	// so it's deferred to a client-only effect instead, matching the Timestamp Converter's fix for the
	// same class of bug.
	const [nextRuns, setNextRuns] = useState<Date[]>([]);
	useEffect(() => {
		setNextRuns(result.valid && result.expression ? getNextRunTimes(result.expression, { count: 5 }) : []);
	}, [result]);

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<ToolToolbar className="justify-between">
					<label className="flex items-center gap-2 text-sm text-muted-foreground">
						<Sparkles className="size-4" />
						Examples
						<select
							onChange={event => {
								if (event.target.value) setInput(event.target.value);
							}}
							defaultValue=""
							className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							aria-label="Example cron expressions"
						>
							<option value="" disabled>
								Choose an example…
							</option>
							{EXAMPLE_CRON_EXPRESSIONS.map(example => (
								<option key={example.expression} value={example.expression}>
									{example.label} — {example.expression}
								</option>
							))}
						</select>
					</label>

					<Button onClick={() => setInput("")} variant="ghost" size="sm" disabled={!input} className="text-destructive hover:bg-destructive-muted">
						<Trash2 className="size-3.5" />
						Clear
					</Button>
				</ToolToolbar>
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
					<span className="text-sm font-medium">Cron expression</span>
					<CopyButton value={input} ariaLabel="Copy cron expression" disabled={!input} />
				</div>
				<div className="px-4 py-3">
					<input
						value={input}
						onChange={event => setInput(event.target.value)}
						placeholder="*/15 9-17 * * 1-5"
						spellCheck={false}
						className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						aria-label="Cron expression to parse"
					/>
				</div>
			</div>

			{!result.valid && (
				<ToolAlert variant="error" title="Couldn't parse this expression">
					<ul className="list-inside list-disc space-y-0.5">
						{result.errors.map((error, index) => (
							<li key={index}>{error.message}</li>
						))}
					</ul>
				</ToolAlert>
			)}

			{result.valid && explanation && (
				<ToolAlert variant="success" title="Human-readable explanation">
					{explanation}
				</ToolAlert>
			)}

			{fields.length > 0 && (
				<ToolPanel title="Field-by-field breakdown" icon={ListChecks}>
					<dl className="divide-y divide-border-subtle">
						{fields.map(field => (
							<div key={field.field} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
								<dt className="text-sm font-medium text-foreground">
									{FIELD_LABELS[field.field]}
									<code className="ml-2 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{field.value}</code>
								</dt>
								<dd className="text-sm text-muted-foreground">{field.meaning}</dd>
							</div>
						))}
					</dl>
				</ToolPanel>
			)}

			{nextRuns.length > 0 && (
				<ToolPanel title="Next 5 run times" icon={CalendarClock}>
					<ul className="divide-y divide-border-subtle">
						{nextRuns.map(run => (
							<li key={run.toISOString()} className="px-4 py-2.5 text-sm text-foreground">
								{DATE_FORMATTER.format(run)}
							</li>
						))}
					</ul>
					<p className="border-t border-border-subtle px-4 py-2.5 text-xs text-muted-foreground">
						Calculated in your browser&apos;s local timezone, from the current time.
					</p>
				</ToolPanel>
			)}
		</div>
	);
}
