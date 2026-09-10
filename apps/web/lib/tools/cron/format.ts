import { FIELD_ORDER, validateCronExpression } from "./fields";
import type { CronExpression, CronParseResult } from "./types";

export function toCronString(expression: CronExpression): string {
	return FIELD_ORDER.map(field => expression[field]).join(" ");
}

/** Parses a raw 5-field cron string, validating each field against its range. */
export function parseCronString(input: string): CronParseResult {
	const trimmed = input.trim();
	if (!trimmed) {
		return { valid: false, errors: [{ field: "minute", message: "Enter a cron expression." }] };
	}

	const parts = trimmed.split(/\s+/);
	if (parts.length !== 5) {
		return {
			valid: false,
			errors: [
				{
					field: "minute",
					message: `Expected exactly 5 fields (minute hour day-of-month month day-of-week), got ${parts.length}. This tool supports standard 5-field cron syntax — special strings like "@daily" or a seconds field aren't supported.`,
				},
			],
		};
	}

	const expression: CronExpression = {
		minute: parts[0]!,
		hour: parts[1]!,
		dayOfMonth: parts[2]!,
		month: parts[3]!,
		dayOfWeek: parts[4]!,
	};

	const errors = validateCronExpression(expression);
	return errors.length > 0 ? { valid: false, expression, errors } : { valid: true, expression, errors: [] };
}
