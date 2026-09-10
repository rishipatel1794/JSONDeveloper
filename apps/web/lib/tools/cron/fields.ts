import type { CronExpression, CronFieldName, CronFieldRange, CronValidationError } from "./types";

export const FIELD_RANGES: Record<CronFieldName, CronFieldRange> = {
	minute: { min: 0, max: 59 },
	hour: { min: 0, max: 23 },
	dayOfMonth: { min: 1, max: 31 },
	month: { min: 1, max: 12 },
	// 0 and 7 both mean Sunday, per standard cron.
	dayOfWeek: { min: 0, max: 7 },
};

export const FIELD_LABELS: Record<CronFieldName, string> = {
	minute: "Minute",
	hour: "Hour",
	dayOfMonth: "Day of month",
	month: "Month",
	dayOfWeek: "Day of week",
};

export const FIELD_ORDER: CronFieldName[] = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];

export const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Normalizes day-of-week 7 to 0 (both mean Sunday). */
export function normalizeDayOfWeek(value: number): number {
	return value === 7 ? 0 : value;
}

const SEGMENT_PATTERN = /^(\*|\d+)(-(\d+))?(\/(\d+))?$/;

/** Validates a single comma-separated cron field (e.g. "1,3,5-10/2") against its numeric range. */
export function validateField(field: CronFieldName, value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed) return `${FIELD_LABELS[field]} cannot be empty.`;

	const range = FIELD_RANGES[field];
	const segments = trimmed.split(",");

	for (const segment of segments) {
		const match = SEGMENT_PATTERN.exec(segment);
		if (!match) {
			return `"${segment}" is not a valid value for ${FIELD_LABELS[field].toLowerCase()}.`;
		}

		const [, base, , rangeEnd, , step] = match;

		if (base !== "*") {
			const baseNum = Number(base);
			if (baseNum < range.min || baseNum > range.max) {
				return `${FIELD_LABELS[field]} value ${baseNum} is outside the valid range ${range.min}-${range.max}.`;
			}
		}

		if (rangeEnd !== undefined) {
			if (base === "*") return `"${segment}" is not valid — a range needs a starting number, not *.`;
			const startNum = Number(base);
			const endNum = Number(rangeEnd);
			if (endNum < range.min || endNum > range.max) {
				return `${FIELD_LABELS[field]} value ${endNum} is outside the valid range ${range.min}-${range.max}.`;
			}
			if (endNum < startNum) {
				return `"${segment}" is not valid — the range end must not be before the start.`;
			}
		}

		if (step !== undefined) {
			const stepNum = Number(step);
			if (stepNum <= 0) return `"${segment}" is not valid — the step must be a positive number.`;
		}
	}

	return null;
}

export function validateCronExpression(expression: CronExpression): CronValidationError[] {
	const errors: CronValidationError[] = [];

	for (const field of FIELD_ORDER) {
		const message = validateField(field, expression[field]);
		if (message) errors.push({ field, message });
	}

	return errors;
}

interface ParsedSegment {
	kind: "wildcard" | "wildcardStep" | "single" | "range" | "rangeStep";
	start?: number;
	end?: number;
	step?: number;
}

/** Parses one already-validated comma segment into a structured form used by matching/describing logic. */
export function parseSegment(segment: string): ParsedSegment {
	const match = SEGMENT_PATTERN.exec(segment.trim());
	if (!match) return { kind: "wildcard" };

	const [, base, , rangeEnd, , step] = match;
	const stepNum = step !== undefined ? Number(step) : undefined;

	if (base === "*") {
		return stepNum !== undefined ? { kind: "wildcardStep", step: stepNum } : { kind: "wildcard" };
	}

	const startNum = Number(base);
	if (rangeEnd !== undefined) {
		const endNum = Number(rangeEnd);
		return stepNum !== undefined
			? { kind: "rangeStep", start: startNum, end: endNum, step: stepNum }
			: { kind: "range", start: startNum, end: endNum };
	}

	return { kind: "single", start: startNum };
}

/** Expands a validated cron field into the concrete set of numbers it matches, within its range. */
export function expandField(field: CronFieldName, value: string): Set<number> {
	const range = FIELD_RANGES[field];
	const result = new Set<number>();

	for (const rawSegment of value.split(",")) {
		const segment = parseSegment(rawSegment);

		switch (segment.kind) {
			case "wildcard":
				for (let n = range.min; n <= range.max; n++) result.add(n);
				break;
			case "wildcardStep":
				for (let n = range.min; n <= range.max; n += segment.step!) result.add(n);
				break;
			case "single":
				result.add(segment.start!);
				break;
			case "range":
				for (let n = segment.start!; n <= segment.end!; n++) result.add(n);
				break;
			case "rangeStep":
				for (let n = segment.start!; n <= segment.end!; n += segment.step!) result.add(n);
				break;
		}
	}

	if (field === "dayOfWeek" && result.has(7)) {
		result.delete(7);
		result.add(0);
	}

	return result;
}
