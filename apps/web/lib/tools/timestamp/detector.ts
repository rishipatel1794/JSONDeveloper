import type { DetectedKind } from "./types";

const INTEGER_PATTERN = /^[+-]?\d+$/;
const ISO_WITH_OFFSET_PATTERN = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/i;
const NAIVE_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/;

/**
 * Digit-count buckets for a positive integer, chosen so "now" falls comfortably inside each bucket
 * regardless of unit: ~10 digits for seconds (through year ~2286), ~13 for milliseconds, ~16 for
 * microseconds, and anything longer is treated as nanoseconds.
 */
function unixKindFromDigitCount(absValue: bigint): DetectedKind {
	const digits = absValue.toString().length;
	if (digits <= 10) return "unix-seconds";
	if (digits <= 13) return "unix-milliseconds";
	if (digits <= 16) return "unix-microseconds";
	return "unix-nanoseconds";
}

/** Pure classification — no parsing side effects. Used by "Auto Detect" mode. */
export function detectKind(raw: string): DetectedKind {
	const trimmed = raw.trim();
	if (!trimmed) return "invalid";

	if (INTEGER_PATTERN.test(trimmed)) {
		let value: bigint;
		try {
			value = BigInt(trimmed);
		} catch {
			return "invalid";
		}
		return unixKindFromDigitCount(value < 0n ? -value : value);
	}

	if (ISO_WITH_OFFSET_PATTERN.test(trimmed)) return "iso";
	if (NAIVE_DATETIME_PATTERN.test(trimmed)) return "datetime";

	return "invalid";
}

export function describeDetectedKind(kind: DetectedKind): string {
	switch (kind) {
		case "unix-seconds":
			return "Unix timestamp — seconds";
		case "unix-milliseconds":
			return "Unix timestamp — milliseconds";
		case "unix-microseconds":
			return "Unix timestamp — microseconds";
		case "unix-nanoseconds":
			return "Unix timestamp — nanoseconds";
		case "iso":
			return "ISO 8601";
		case "datetime":
			return "Date & time";
		case "invalid":
			return "Unrecognized";
	}
}
