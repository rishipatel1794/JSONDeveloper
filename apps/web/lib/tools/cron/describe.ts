import { DAY_NAMES, expandField, MONTH_NAMES, normalizeDayOfWeek, parseSegment } from "./fields";
import type { CronExpression } from "./types";

function pad2(n: number): string {
	return n.toString().padStart(2, "0");
}

/** "9:00 AM", "17:30" -> "5:30 PM". */
function formatClockTime(hour: number, minute: number): string {
	const period = hour < 12 ? "AM" : "PM";
	const displayHour = hour % 12 === 0 ? 12 : hour % 12;
	return `${displayHour}:${pad2(minute)} ${period}`;
}

function formatHourOnly(hour: number): string {
	const period = hour < 12 ? "AM" : "PM";
	const displayHour = hour % 12 === 0 ? 12 : hour % 12;
	return `${displayHour} ${period}`;
}

function ordinal(n: number): string {
	const remainder10 = n % 10;
	const remainder100 = n % 100;
	if (remainder10 === 1 && remainder100 !== 11) return `${n}st`;
	if (remainder10 === 2 && remainder100 !== 12) return `${n}nd`;
	if (remainder10 === 3 && remainder100 !== 13) return `${n}rd`;
	return `${n}th`;
}

function joinList(items: string[]): string {
	if (items.length === 0) return "";
	if (items.length === 1) return items[0]!;
	if (items.length === 2) return `${items[0]} and ${items[1]}`;
	return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

/** Generic, always-correct description of a field's raw value — the fallback when no nicer phrasing applies. */
function describeFieldGeneric(value: string, names?: string[]): string {
	if (value === "*") return "every value";

	return value
		.split(",")
		.map(rawSegment => {
			const segment = parseSegment(rawSegment);
			const label = (n: number) => names?.[n] ?? String(n);

			switch (segment.kind) {
				case "wildcard":
					return "every value";
				case "wildcardStep":
					return `every ${segment.step}`;
				case "single":
					return label(segment.start!);
				case "range":
					return `${label(segment.start!)}-${label(segment.end!)}`;
				case "rangeStep":
					return `${label(segment.start!)}-${label(segment.end!)}/${segment.step}`;
			}
		})
		.join(", ");
}

/** Describes the minute + hour combination — the part of the sentence describing *when in the day* it runs. */
function describeTime(minute: string, hour: string): string {
	if (!minute.includes(",") && !hour.includes(",")) {
		const m = parseSegment(minute);
		const h = parseSegment(hour);

		if (m.kind === "wildcard" && h.kind === "wildcard") return "every minute";
		if (m.kind === "wildcardStep" && h.kind === "wildcard") return `every ${m.step} minutes`;

		if ((m.kind === "wildcard" || m.kind === "wildcardStep") && (h.kind === "range" || h.kind === "rangeStep")) {
			const frequency = m.kind === "wildcardStep" ? `every ${m.step} minutes` : "every minute";
			return `${frequency} between ${formatClockTime(h.start!, 0)} and ${formatClockTime(h.end!, 59)}`;
		}

		if (m.kind === "single" && h.kind === "wildcard") return `every hour at minute ${m.start}`;
		if (m.kind === "single" && h.kind === "single") return `at ${formatClockTime(h.start!, m.start!)}`;

		if ((m.kind === "wildcard" || m.kind === "wildcardStep") && h.kind === "single") {
			const frequency = m.kind === "wildcardStep" ? `every ${m.step} minutes` : "every minute";
			return `${frequency}, during the ${formatHourOnly(h.start!)} hour`;
		}

		if (m.kind === "single" && (h.kind === "range" || h.kind === "rangeStep")) {
			return `at minute ${m.start} past every hour from ${formatHourOnly(h.start!)} through ${formatHourOnly(h.end!)}`;
		}
	}

	return `at minute ${describeFieldGeneric(minute)}, hour ${describeFieldGeneric(hour)}`;
}

interface DayClause {
	prefix: string;
	suffix: string;
}

/**
 * `preferPrefix` controls "every Monday at 9:00 AM" (short, simple time — reads naturally with the
 * day first) vs "every 15 minutes between 9:00 AM and 5:59 PM, Monday through Friday" (a time phrase
 * that's already a clause of its own reads better with the day appended after it).
 */
function describeDayClause(dayOfMonth: string, dayOfWeek: string, preferPrefix: boolean): DayClause {
	const domRestricted = dayOfMonth !== "*";
	const dowRestricted = dayOfWeek !== "*";

	if (!domRestricted && !dowRestricted) return { prefix: "", suffix: "" };

	const domPhrase = () => {
		if (!dayOfMonth.includes(",") && !dayOfMonth.includes("-") && !dayOfMonth.includes("/")) {
			return `the ${ordinal(Number(dayOfMonth))} of the month`;
		}
		return `day-of-month ${describeFieldGeneric(dayOfMonth)}`;
	};

	if (domRestricted && !dowRestricted) {
		return { prefix: "", suffix: `, on ${domPhrase()}` };
	}

	if (!domRestricted && dowRestricted) {
		const dowSet = [...expandField("dayOfWeek", dayOfWeek)].sort((a, b) => a - b);
		const isSimpleValue = !dayOfWeek.includes(",") && !dayOfWeek.includes("/");

		if (preferPrefix) {
			if (dowSet.length === 5 && [1, 2, 3, 4, 5].every(d => dowSet.includes(d))) {
				return { prefix: "every weekday ", suffix: "" };
			}
			if (dowSet.length === 2 && [0, 6].every(d => dowSet.includes(d))) {
				return { prefix: "every weekend day ", suffix: "" };
			}
			if (isSimpleValue && parseSegment(dayOfWeek).kind === "single") {
				return { prefix: `every ${DAY_NAMES[normalizeDayOfWeek(parseSegment(dayOfWeek).start!)]} `, suffix: "" };
			}
		}

		if (isSimpleValue) {
			const segment = parseSegment(dayOfWeek);
			if (segment.kind === "single") {
				return { prefix: "", suffix: `, on ${DAY_NAMES[normalizeDayOfWeek(segment.start!)]}` };
			}
			if (segment.kind === "range") {
				const start = normalizeDayOfWeek(segment.start!);
				const end = normalizeDayOfWeek(segment.end!);
				return { prefix: "", suffix: `, ${DAY_NAMES[start]} through ${DAY_NAMES[end]}` };
			}
		}

		return { prefix: "", suffix: `, on ${joinList(dowSet.map(d => DAY_NAMES[d]!))}` };
	}

	// Both restricted: standard cron treats this as OR (fires when either matches) — documented as a limitation.
	const dowSet = [...expandField("dayOfWeek", dayOfWeek)].sort((a, b) => a - b);
	return { prefix: "", suffix: `, on ${domPhrase()} or on ${joinList(dowSet.map(d => DAY_NAMES[d]!))}` };
}

function describeMonthClause(month: string): string {
	if (month === "*") return "";
	return `, in ${describeFieldGeneric(month, ["", ...MONTH_NAMES])}`;
}

function capitalize(sentence: string): string {
	return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/** Produces a single human-readable sentence for a cron expression, e.g. "Runs every Monday at 9:00 AM." */
export function describeCronExpression(expression: CronExpression): string {
	const { minute, hour, dayOfMonth, month, dayOfWeek } = expression;
	const hourIsSimpleClockTime = !hour.includes(",") && parseSegment(hour).kind === "single";
	const dayClause = describeDayClause(dayOfMonth, dayOfWeek, hourIsSimpleClockTime);
	const timePhrase = describeTime(minute, hour);
	const monthClause = describeMonthClause(month);

	return capitalize(`runs ${dayClause.prefix}${timePhrase}${dayClause.suffix}${monthClause}.`);
}

const FIELD_DESCRIBERS: Record<keyof CronExpression, (value: string) => string> = {
	minute: value => describeSingleFieldMeaning(value, "minute", undefined),
	hour: value => describeSingleFieldMeaning(value, "hour", undefined),
	dayOfMonth: value => describeSingleFieldMeaning(value, "day of the month", undefined),
	month: value => describeSingleFieldMeaning(value, "month", MONTH_NAMES),
	dayOfWeek: value => describeSingleFieldMeaning(value, "day of the week", DAY_NAMES),
};

function describeSingleFieldMeaning(value: string, unit: string, names: string[] | undefined): string {
	if (value === "*") return `every ${unit}`;

	return value
		.split(",")
		.map(rawSegment => {
			const segment = parseSegment(rawSegment);
			const label = (n: number) => (names ? (names[unit === "month" ? n - 1 : n] ?? String(n)) : String(n));

			switch (segment.kind) {
				case "wildcard":
					return `every ${unit}`;
				case "wildcardStep":
					return `every ${segment.step} ${unit}${segment.step === 1 ? "" : "s"}`;
				case "single":
					return label(segment.start!);
				case "range":
					return `${label(segment.start!)} through ${label(segment.end!)}`;
				case "rangeStep":
					return `every ${segment.step} ${unit}s from ${label(segment.start!)} through ${label(segment.end!)}`;
			}
		})
		.join(", ");
}

/** Per-field explanations for the breakdown list, e.g. field "minute" with value "star-slash-15" means "every 15 minutes". */
export function describeFields(expression: CronExpression): { field: keyof CronExpression; value: string; meaning: string }[] {
	return (Object.keys(FIELD_DESCRIBERS) as (keyof CronExpression)[]).map(field => ({
		field,
		value: expression[field],
		meaning: FIELD_DESCRIBERS[field](expression[field]),
	}));
}
