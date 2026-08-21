import { describe, expect, it } from "vitest";

import { buildTimestampResult, parseTimestampInput, parseZonedDateTime, unitLabel } from "./converter";

describe("parseTimestampInput — Unix seconds", () => {
	it("converts a typical seconds timestamp", () => {
		const outcome = parseTimestampInput("1755000000", "auto", "UTC");
		expect(outcome).toMatchObject({ success: true, kind: "unix-seconds", unit: "seconds", epochMs: 1755000000000 });
	});

	it("handles the epoch (0)", () => {
		const outcome = parseTimestampInput("0", "auto", "UTC");
		expect(outcome).toMatchObject({ success: true, epochMs: 0 });
	});

	it("handles 1 second after the epoch", () => {
		const outcome = parseTimestampInput("1", "auto", "UTC");
		expect(outcome).toMatchObject({ success: true, epochMs: 1000 });
	});

	it("handles a negative timestamp (before the epoch) — must not be rejected", () => {
		const outcome = parseTimestampInput("-1", "auto", "UTC");
		expect(outcome).toMatchObject({ success: true, epochMs: -1000 });
	});

	it("honors an explicit unix-seconds input type even for a 13-digit number", () => {
		const outcome = parseTimestampInput("1755000000000", "unix-seconds", "UTC");
		expect(outcome).toMatchObject({ success: true, unit: "seconds", epochMs: 1755000000000000 });
	});
});

describe("parseTimestampInput — Unix milliseconds", () => {
	it("converts a typical milliseconds timestamp", () => {
		const outcome = parseTimestampInput("1755000000000", "auto", "UTC");
		expect(outcome).toMatchObject({ success: true, kind: "unix-milliseconds", unit: "milliseconds", epochMs: 1755000000000 });
	});

	it("handles 0", () => {
		expect(parseTimestampInput("0", "unix-milliseconds", "UTC")).toMatchObject({ success: true, epochMs: 0 });
	});

	it("handles 1000ms", () => {
		expect(parseTimestampInput("1000", "unix-milliseconds", "UTC")).toMatchObject({ success: true, epochMs: 1000 });
	});
});

describe("parseTimestampInput — ISO 8601", () => {
	it("parses the epoch instant", () => {
		const outcome = parseTimestampInput("1970-01-01T00:00:00Z", "auto", "UTC");
		expect(outcome).toMatchObject({ success: true, kind: "iso", epochMs: 0 });
	});

	it("parses a Z-suffixed instant", () => {
		const outcome = parseTimestampInput("2026-08-12T12:30:00Z", "auto", "UTC");
		expect(outcome.success).toBe(true);
		expect(new Date(outcome.epochMs!).toISOString()).toBe("2026-08-12T12:30:00.000Z");
	});

	it("preserves an explicit numeric offset", () => {
		// 18:00 +05:30 is 12:30 UTC.
		const outcome = parseTimestampInput("2026-08-12T18:00:00+05:30", "auto", "UTC");
		expect(outcome.success).toBe(true);
		expect(new Date(outcome.epochMs!).toISOString()).toBe("2026-08-12T12:30:00.000Z");
	});
});

describe("parseTimestampInput — invalid input", () => {
	it("rejects empty input", () => {
		expect(parseTimestampInput("", "auto", "UTC").success).toBe(false);
		expect(parseTimestampInput("   ", "auto", "UTC").success).toBe(false);
	});

	it("rejects non-numeric garbage", () => {
		expect(parseTimestampInput("abc", "auto", "UTC").success).toBe(false);
		expect(parseTimestampInput("123abc", "auto", "UTC").success).toBe(false);
	});

	it("rejects NaN and Infinity as literal text", () => {
		expect(parseTimestampInput("NaN", "auto", "UTC").success).toBe(false);
		expect(parseTimestampInput("Infinity", "auto", "UTC").success).toBe(false);
	});

	it("rejects a timestamp outside the supported JS Date range", () => {
		// A 25-digit number is treated as nanoseconds; even after dividing down to milliseconds it's
		// still far beyond the +-8.64e15ms range a JS Date can represent.
		const outcome = parseTimestampInput("9999999999999999999999999", "auto", "UTC");
		expect(outcome.success).toBe(false);
		expect(outcome.error).toMatch(/outside the supported/i);
	});
});

describe("buildTimestampResult", () => {
	it("produces every expected field", () => {
		const result = buildTimestampResult(1755000000000, "UTC");
		expect(result.unixSeconds).toBe("1755000000");
		expect(result.unixMilliseconds).toBe("1755000000000");
		expect(result.iso).toBe("2025-08-12T12:00:00.000Z");
		expect(result.timezone).toBe("UTC");
		expect(result.utc).toContain("2025");
	});

	it("floors fractional seconds toward -Infinity for negative epoch values", () => {
		const result = buildTimestampResult(-500, "UTC");
		expect(result.unixSeconds).toBe("-1");
	});
});

describe("parseZonedDateTime", () => {
	it("interprets a wall-clock date/time as belonging to the given timezone", () => {
		// 2026-08-12 17:30:00 in Asia/Kolkata (UTC+05:30) is 12:00:00 UTC.
		const outcome = parseZonedDateTime("2026-08-12", "17:30:00", "Asia/Kolkata");
		expect(outcome.success).toBe(true);
		expect(new Date(outcome.epochMs!).toISOString()).toBe("2026-08-12T12:00:00.000Z");
	});

	it("rejects an invalid date", () => {
		expect(parseZonedDateTime("2026-13-01", "12:00:00", "UTC").success).toBe(false);
	});

	it("rejects an unknown timezone", () => {
		expect(parseZonedDateTime("2026-08-12", "12:00:00", "Not/AZone").success).toBe(false);
	});
});

describe("unitLabel", () => {
	it("capitalizes every unit", () => {
		expect(unitLabel("seconds")).toBe("Seconds");
		expect(unitLabel("milliseconds")).toBe("Milliseconds");
		expect(unitLabel("microseconds")).toBe("Microseconds");
		expect(unitLabel("nanoseconds")).toBe("Nanoseconds");
	});
});
