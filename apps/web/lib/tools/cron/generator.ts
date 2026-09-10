import type { CronExpression, CronPreset } from "./types";

export { toCronString } from "./format";

function expr(minute: string, hour: string, dayOfMonth = "*", month = "*", dayOfWeek = "*"): CronExpression {
	return { minute, hour, dayOfMonth, month, dayOfWeek };
}

/**
 * Convenient starting points for the schedule builder. "Custom" isn't included here — it just means
 * no preset is applied and the user edits the fields directly.
 */
export const CRON_PRESETS: CronPreset[] = [
	{ label: "Every minute", expression: expr("*", "*") },
	{ label: "Every 5 minutes", expression: expr("*/5", "*") },
	{ label: "Every 15 minutes", expression: expr("*/15", "*") },
	{ label: "Every 30 minutes", expression: expr("*/30", "*") },
	{ label: "Every hour", expression: expr("0", "*") },
	{ label: "Every day", expression: expr("0", "0") },
	{ label: "Every day at 9:00 AM", expression: expr("0", "9") },
	{ label: "Every weekday at 9:00 AM", expression: expr("0", "9", "*", "*", "1-5") },
	{ label: "Every week (Sunday at midnight)", expression: expr("0", "0", "*", "*", "0") },
	{ label: "Every month (1st at midnight)", expression: expr("0", "0", "1") },
	{ label: "Every Sunday at 9:00 AM", expression: expr("0", "9", "*", "*", "0") },
];

export const DEFAULT_CRON_EXPRESSION: CronExpression = CRON_PRESETS[6]!.expression;
