import type { RelativeTimeInfo } from "./types";

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
	{ unit: "year", ms: 365.25 * 24 * 60 * 60 * 1000 },
	{ unit: "month", ms: 30.44 * 24 * 60 * 60 * 1000 },
	{ unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
	{ unit: "day", ms: 24 * 60 * 60 * 1000 },
	{ unit: "hour", ms: 60 * 60 * 1000 },
	{ unit: "minute", ms: 60 * 1000 },
];

const JUST_NOW_THRESHOLD_MS = 30_000;

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Relative time from `nowMs` to `targetMs` — e.g. "5 minutes ago", "in 2 hours", "just now". */
export function getRelativeTime(targetMs: number, nowMs: number = Date.now()): RelativeTimeInfo {
	const diffMs = targetMs - nowMs;
	const absMs = Math.abs(diffMs);

	if (absMs < JUST_NOW_THRESHOLD_MS) {
		return { label: "just now", direction: "present" };
	}

	for (const { unit, ms } of UNITS) {
		if (absMs >= ms) {
			const value = Math.round(diffMs / ms);
			if (value !== 0) {
				return { label: rtf.format(value, unit), direction: diffMs < 0 ? "past" : "future" };
			}
		}
	}

	const seconds = Math.round(diffMs / 1000);
	return { label: rtf.format(seconds, "second"), direction: diffMs < 0 ? "past" : "future" };
}
