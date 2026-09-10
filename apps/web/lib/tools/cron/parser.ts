import { expandField } from "./fields";
import { describeCronExpression, describeFields } from "./describe";
import type { CronExpression, CronParseResult } from "./types";

export { parseCronString } from "./format";
export { describeCronExpression, describeFields };

export interface NextRunOptions {
	count?: number;
	from?: Date;
	/** Safety cap so a rare expression (e.g. Feb 29 at a specific weekday) can't loop indefinitely. */
	maxIterations?: number;
}

/**
 * Brute-force scans forward minute-by-minute, which correctly handles cron's day-of-month/day-of-week
 * OR semantics for free (it just tests concrete calendar dates rather than combining field logic
 * abstractly). Bounded by `maxIterations` — an expression with no match in that window returns fewer
 * than `count` results rather than hanging.
 */
export function getNextRunTimes(expression: CronExpression, options: NextRunOptions = {}): Date[] {
	const { count = 5, from = new Date(), maxIterations = 366 * 24 * 60 } = options;

	const minuteSet = expandField("minute", expression.minute);
	const hourSet = expandField("hour", expression.hour);
	const monthSet = expandField("month", expression.month);
	const domSet = expandField("dayOfMonth", expression.dayOfMonth);
	const dowSet = expandField("dayOfWeek", expression.dayOfWeek);
	const domRestricted = expression.dayOfMonth !== "*";
	const dowRestricted = expression.dayOfWeek !== "*";

	const results: Date[] = [];
	const candidate = new Date(from);
	candidate.setSeconds(0, 0);
	candidate.setMinutes(candidate.getMinutes() + 1);

	for (let iteration = 0; iteration < maxIterations && results.length < count; iteration++) {
		const matchesDay =
			!domRestricted && !dowRestricted
				? true
				: domRestricted && dowRestricted
					? domSet.has(candidate.getDate()) || dowSet.has(candidate.getDay())
					: domRestricted
						? domSet.has(candidate.getDate())
						: dowSet.has(candidate.getDay());

		if (
			minuteSet.has(candidate.getMinutes()) &&
			hourSet.has(candidate.getHours()) &&
			monthSet.has(candidate.getMonth() + 1) &&
			matchesDay
		) {
			results.push(new Date(candidate));
		}

		candidate.setMinutes(candidate.getMinutes() + 1);
	}

	return results;
}

export const EXAMPLE_CRON_EXPRESSIONS = [
	{ expression: "*/5 * * * *", label: "Every 5 minutes" },
	{ expression: "0 9 * * *", label: "Every day at 9:00 AM" },
	{ expression: "0 9 * * 1-5", label: "Weekdays at 9:00 AM" },
	{ expression: "*/15 9-17 * * 1-5", label: "Every 15 minutes, 9 AM-6 PM, weekdays" },
	{ expression: "0 0 1 * *", label: "First of the month at midnight" },
	{ expression: "0 0 * * 0", label: "Every Sunday at midnight" },
];

export type { CronParseResult };
