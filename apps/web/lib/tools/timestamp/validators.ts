/**
 * ECMA-262's valid time value range: +-8,640,000,000,000,000ms from the epoch (~273,790 years).
 * Anything outside this can't be represented by a JS Date at all, so it must be rejected explicitly
 * rather than silently producing an Invalid Date.
 */
export const MIN_DATE_MS = -8_640_000_000_000_000n;
export const MAX_DATE_MS = 8_640_000_000_000_000n;

const INTEGER_PATTERN = /^[+-]?\d+$/;

export interface ParsedInteger {
	valid: boolean;
	value?: bigint;
	error?: string;
}

/** Parses a strict integer string (optionally signed) into a BigInt — never loses precision, unlike Number(). */
export function parseIntegerString(raw: string): ParsedInteger {
	const trimmed = raw.trim();

	if (!trimmed) return { valid: false, error: "Enter a timestamp." };
	if (!INTEGER_PATTERN.test(trimmed)) {
		return { valid: false, error: "Input is not a valid number." };
	}

	try {
		return { valid: true, value: BigInt(trimmed) };
	} catch {
		return { valid: false, error: "Input is not a valid number." };
	}
}

export function isWithinDateRange(ms: bigint): boolean {
	return ms >= MIN_DATE_MS && ms <= MAX_DATE_MS;
}

/** Floor division for BigInt — regular `/` truncates toward zero, which is wrong for negative dividends. */
export function bigFloorDiv(a: bigint, b: bigint): bigint {
	const quotient = a / b;
	const remainder = a % b;
	return remainder !== 0n && remainder < 0n !== b < 0n ? quotient - 1n : quotient;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

export interface ParsedDateParts {
	valid: boolean;
	year?: number;
	month?: number;
	day?: number;
	error?: string;
}

/** Validates a "YYYY-MM-DD" string, rejecting calendar-invalid dates like 2026-02-30. */
export function parseDateOnlyString(raw: string): ParsedDateParts {
	const trimmed = raw.trim();
	const match = DATE_ONLY_PATTERN.exec(trimmed);
	if (!match) return { valid: false, error: "Enter a date as YYYY-MM-DD." };

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);

	if (month < 1 || month > 12) return { valid: false, error: "Month must be between 01 and 12." };

	const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
	if (day < 1 || day > daysInMonth) return { valid: false, error: `Day must be between 01 and ${daysInMonth} for that month.` };

	return { valid: true, year, month, day };
}

export interface ParsedTimeParts {
	valid: boolean;
	hour?: number;
	minute?: number;
	second?: number;
	millisecond?: number;
	error?: string;
}

/** Validates an "HH:mm[:ss[.SSS]]" string. */
export function parseTimeOfDayString(raw: string): ParsedTimeParts {
	const trimmed = raw.trim();
	const match = TIME_PATTERN.exec(trimmed);
	if (!match) return { valid: false, error: "Enter a time as HH:mm:ss." };

	const hour = Number(match[1]);
	const minute = Number(match[2]);
	const second = match[3] !== undefined ? Number(match[3]) : 0;
	const millisecond = match[4] !== undefined ? Number(match[4].padEnd(3, "0")) : 0;

	if (hour > 23) return { valid: false, error: "Hour must be between 00 and 23." };
	if (minute > 59) return { valid: false, error: "Minute must be between 00 and 59." };
	if (second > 59) return { valid: false, error: "Second must be between 00 and 59." };

	return { valid: true, hour, minute, second, millisecond };
}
