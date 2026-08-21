import { detectKind } from "./detector";
import { getRelativeTime } from "./relative-time";
import { formatFriendly, isValidTimezone, zonedTimeToUtcMs } from "./timezone";
import type { DetectedKind, InputType, TimestampInspection, TimestampResult, TimestampUnit } from "./types";
import { bigFloorDiv, isWithinDateRange, parseDateOnlyString, parseIntegerString, parseTimeOfDayString } from "./validators";

const ISO_WITH_OFFSET_PATTERN = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/i;

const UNIT_BY_UNIX_KIND: Partial<Record<DetectedKind, TimestampUnit>> = {
	"unix-seconds": "seconds",
	"unix-milliseconds": "milliseconds",
	"unix-microseconds": "microseconds",
	"unix-nanoseconds": "nanoseconds",
};

export function unitLabel(unit: TimestampUnit): string {
	switch (unit) {
		case "seconds":
			return "Seconds";
		case "milliseconds":
			return "Milliseconds";
		case "microseconds":
			return "Microseconds";
		case "nanoseconds":
			return "Nanoseconds";
	}
}

function unixValueToEpochMs(value: bigint, unit: TimestampUnit): bigint {
	switch (unit) {
		case "seconds":
			return value * 1000n;
		case "milliseconds":
			return value;
		case "microseconds":
			return bigFloorDiv(value, 1_000n);
		case "nanoseconds":
			return bigFloorDiv(value, 1_000_000n);
	}
}

/** Resolves the effective kind once an explicit (non-"auto") input type is chosen — the user's unit choice always wins over digit-count heuristics. */
function resolveExplicitKind(trimmed: string, inputType: InputType): DetectedKind {
	const detected = detectKind(trimmed);
	const isUnixLike = detected === "unix-seconds" || detected === "unix-milliseconds" || detected === "unix-microseconds" || detected === "unix-nanoseconds";
	const isDateLike = detected === "iso" || detected === "datetime";

	switch (inputType) {
		case "unix-seconds":
			return isUnixLike ? "unix-seconds" : "invalid";
		case "unix-milliseconds":
			return isUnixLike ? "unix-milliseconds" : "invalid";
		case "iso":
			return isDateLike ? "iso" : "invalid";
		case "datetime":
			return isDateLike ? "datetime" : "invalid";
		case "auto":
			return detected;
	}
}

function explicitModeErrorMessage(inputType: InputType): string {
	switch (inputType) {
		case "unix-seconds":
		case "unix-milliseconds":
			return "Enter a valid integer Unix timestamp.";
		case "iso":
			return "Enter a valid ISO 8601 date, e.g. 2026-08-12T12:30:00Z.";
		case "datetime":
			return "Enter a valid date and time, e.g. 2026-08-12 17:30:00.";
		case "auto":
			return "Input is not a valid number or date.";
	}
}

interface DateParseSuccess {
	success: true;
	epochMs: number;
}
interface DateParseFailure {
	success: false;
	error: string;
}

/** Parses an ISO/datetime string. A string with an explicit offset/Z is unambiguous (native `Date` parsing is fine); a naive string is treated as wall-clock time in `timezone`. */
function parseDateLikeString(trimmed: string, timezone: string): DateParseSuccess | DateParseFailure {
	if (ISO_WITH_OFFSET_PATTERN.test(trimmed)) {
		const normalized = trimmed.replace(" ", "T");
		const parsed = new Date(normalized);
		if (Number.isNaN(parsed.getTime())) return { success: false, error: "This does not look like a valid ISO 8601 date." };
		return { success: true, epochMs: parsed.getTime() };
	}

	if (!isValidTimezone(timezone)) return { success: false, error: `Unknown timezone: ${timezone}.` };

	const separatorIndex = trimmed.search(/[T ]/);
	const datePart = separatorIndex === -1 ? trimmed : trimmed.slice(0, separatorIndex);
	const timePart = separatorIndex === -1 ? "00:00:00" : trimmed.slice(separatorIndex + 1);

	const dateParsed = parseDateOnlyString(datePart);
	if (!dateParsed.valid || dateParsed.year === undefined || dateParsed.month === undefined || dateParsed.day === undefined) {
		return { success: false, error: dateParsed.error ?? "Enter a valid date." };
	}

	const timeParsed = parseTimeOfDayString(timePart);
	if (!timeParsed.valid || timeParsed.hour === undefined || timeParsed.minute === undefined) {
		return { success: false, error: timeParsed.error ?? "Enter a valid time." };
	}

	const epochMs = zonedTimeToUtcMs(
		dateParsed.year,
		dateParsed.month,
		dateParsed.day,
		timeParsed.hour,
		timeParsed.minute,
		timeParsed.second ?? 0,
		timeParsed.millisecond ?? 0,
		timezone,
	);

	if (!isWithinDateRange(BigInt(epochMs))) return { success: false, error: "Timestamp is outside the supported JavaScript Date range." };

	return { success: true, epochMs };
}

export interface ParseOutcome {
	success: boolean;
	kind: DetectedKind;
	unit?: TimestampUnit;
	epochMs?: number;
	error?: string;
}

/** Main "Timestamp / Date → instant" entry point. Pure — no I/O, no globals besides `Intl`/`Date`. */
export function parseTimestampInput(raw: string, inputType: InputType, timezone: string): ParseOutcome {
	const trimmed = raw.trim();
	if (!trimmed) return { success: false, kind: "invalid", error: "Enter a timestamp or date." };

	const kind = inputType === "auto" ? detectKind(trimmed) : resolveExplicitKind(trimmed, inputType);

	if (kind === "invalid") {
		return { success: false, kind: "invalid", error: explicitModeErrorMessage(inputType) };
	}

	const unit = UNIT_BY_UNIX_KIND[kind];
	if (unit) {
		const parsed = parseIntegerString(trimmed);
		if (!parsed.valid || parsed.value === undefined) {
			return { success: false, kind, error: parsed.error ?? "Input is not a valid number." };
		}

		const epochMsBig = unixValueToEpochMs(parsed.value, unit);
		if (!isWithinDateRange(epochMsBig)) {
			return { success: false, kind, unit, error: "Timestamp is outside the supported JavaScript Date range." };
		}

		return { success: true, kind, unit, epochMs: Number(epochMsBig) };
	}

	const dateResult = parseDateLikeString(trimmed, timezone);
	if (!dateResult.success) return { success: false, kind, error: dateResult.error };
	return { success: true, kind, epochMs: dateResult.epochMs };
}

/** Builds every display value for one resolved instant, in the given display timezone. */
export function buildTimestampResult(epochMs: number, timezone: string): TimestampResult {
	const date = new Date(epochMs);
	const relative = getRelativeTime(epochMs);

	return {
		unixSeconds: String(Math.floor(epochMs / 1000)),
		unixMilliseconds: String(epochMs),
		iso: date.toISOString(),
		utc: formatFriendly(date, "UTC"),
		local: formatFriendly(date, timezone),
		timezone,
		relative: relative.label,
	};
}

/** The full "debugging" view — what powers both the Results panel and the Inspector panel. */
export function inspectTimestampInput(raw: string, inputType: InputType, timezone: string): TimestampInspection {
	const outcome = parseTimestampInput(raw, inputType, timezone);

	if (!outcome.success || outcome.epochMs === undefined) {
		return { valid: false, error: outcome.error ?? "Invalid timestamp.", detectedKind: outcome.kind, unit: outcome.unit };
	}

	const relative = getRelativeTime(outcome.epochMs);

	return {
		valid: true,
		detectedKind: outcome.kind,
		unit: outcome.unit,
		epochMs: outcome.epochMs,
		result: buildTimestampResult(outcome.epochMs, timezone),
		relativeDirection: relative.direction,
	};
}

export interface ZonedDateTimeParseResult {
	success: boolean;
	epochMs?: number;
	error?: string;
}

/** Mode B ("Date → Timestamp"): resolves separate date/time fields as wall-clock time in `timezone`. */
export function parseZonedDateTime(dateStr: string, timeStr: string, timezone: string): ZonedDateTimeParseResult {
	if (!isValidTimezone(timezone)) return { success: false, error: `Unknown timezone: ${timezone}.` };

	const dateParsed = parseDateOnlyString(dateStr);
	if (!dateParsed.valid || dateParsed.year === undefined || dateParsed.month === undefined || dateParsed.day === undefined) {
		return { success: false, error: dateParsed.error ?? "Enter a valid date." };
	}

	const timeParsed = parseTimeOfDayString(timeStr);
	if (!timeParsed.valid || timeParsed.hour === undefined || timeParsed.minute === undefined) {
		return { success: false, error: timeParsed.error ?? "Enter a valid time." };
	}

	const epochMs = zonedTimeToUtcMs(
		dateParsed.year,
		dateParsed.month,
		dateParsed.day,
		timeParsed.hour,
		timeParsed.minute,
		timeParsed.second ?? 0,
		timeParsed.millisecond ?? 0,
		timezone,
	);

	if (!isWithinDateRange(BigInt(epochMs))) return { success: false, error: "Timestamp is outside the supported JavaScript Date range." };

	return { success: true, epochMs };
}
