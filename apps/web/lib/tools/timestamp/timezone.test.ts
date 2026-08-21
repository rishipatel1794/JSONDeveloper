import { describe, expect, it } from "vitest";

import {
	endOfDay,
	endOfMonth,
	endOfYear,
	formatOffsetLabel,
	getZoneOffsetMinutes,
	isValidTimezone,
	startOfDay,
	startOfMonth,
	startOfYear,
	zonedTimeToUtcMs,
} from "./timezone";

describe("zonedTimeToUtcMs", () => {
	it("resolves a wall-clock time in UTC directly", () => {
		expect(zonedTimeToUtcMs(2026, 8, 12, 12, 30, 0, 0, "UTC")).toBe(Date.UTC(2026, 7, 12, 12, 30, 0, 0));
	});

	it("resolves Asia/Kolkata (UTC+05:30, no DST)", () => {
		const ms = zonedTimeToUtcMs(2026, 8, 12, 17, 30, 0, 0, "Asia/Kolkata");
		expect(new Date(ms).toISOString()).toBe("2026-08-12T12:00:00.000Z");
	});

	it("resolves America/New_York in winter (EST, UTC-5)", () => {
		const ms = zonedTimeToUtcMs(2026, 1, 15, 12, 0, 0, 0, "America/New_York");
		expect(new Date(ms).toISOString()).toBe("2026-01-15T17:00:00.000Z");
	});

	it("resolves America/New_York in summer (EDT, UTC-4)", () => {
		const ms = zonedTimeToUtcMs(2026, 7, 15, 12, 0, 0, 0, "America/New_York");
		expect(new Date(ms).toISOString()).toBe("2026-07-15T16:00:00.000Z");
	});

	it("handles the DST spring-forward transition correctly (2 wall-clock hours = 1 real hour)", () => {
		// 2026-03-08 is the US spring-forward date: 02:00 EST jumps straight to 03:00 EDT.
		const before = zonedTimeToUtcMs(2026, 3, 8, 1, 30, 0, 0, "America/New_York");
		const after = zonedTimeToUtcMs(2026, 3, 8, 3, 30, 0, 0, "America/New_York");

		expect(new Date(before).toISOString()).toBe("2026-03-08T06:30:00.000Z");
		expect(new Date(after).toISOString()).toBe("2026-03-08T07:30:00.000Z");
		// Only 1 hour actually elapsed even though the wall clock shows a 2-hour gap.
		expect(after - before).toBe(60 * 60 * 1000);
	});

	it("handles a leap day", () => {
		const ms = zonedTimeToUtcMs(2024, 2, 29, 0, 0, 0, 0, "UTC");
		expect(new Date(ms).toISOString()).toBe("2024-02-29T00:00:00.000Z");
	});
});

describe("getZoneOffsetMinutes", () => {
	it("returns 0 for UTC", () => {
		expect(getZoneOffsetMinutes(new Date("2026-08-12T12:00:00Z"), "UTC")).toBe(0);
	});

	it("returns +330 for Asia/Kolkata", () => {
		expect(getZoneOffsetMinutes(new Date("2026-08-12T12:00:00Z"), "Asia/Kolkata")).toBe(330);
	});

	it("reflects EDT (-240) in summer and EST (-300) in winter for America/New_York", () => {
		expect(getZoneOffsetMinutes(new Date("2026-07-01T12:00:00Z"), "America/New_York")).toBe(-240);
		expect(getZoneOffsetMinutes(new Date("2026-01-01T12:00:00Z"), "America/New_York")).toBe(-300);
	});

	it("returns 0 for Europe/London in winter and +60 in summer (BST)", () => {
		expect(getZoneOffsetMinutes(new Date("2026-01-01T12:00:00Z"), "Europe/London")).toBe(0);
		expect(getZoneOffsetMinutes(new Date("2026-07-01T12:00:00Z"), "Europe/London")).toBe(60);
	});

	it("returns +540 for Asia/Tokyo (no DST)", () => {
		expect(getZoneOffsetMinutes(new Date("2026-01-01T12:00:00Z"), "Asia/Tokyo")).toBe(540);
		expect(getZoneOffsetMinutes(new Date("2026-07-01T12:00:00Z"), "Asia/Tokyo")).toBe(540);
	});
});

describe("formatOffsetLabel", () => {
	it("formats positive, negative, and half-hour offsets", () => {
		expect(formatOffsetLabel(0)).toBe("UTC+00:00");
		expect(formatOffsetLabel(330)).toBe("UTC+05:30");
		expect(formatOffsetLabel(-300)).toBe("UTC-05:00");
	});
});

describe("isValidTimezone", () => {
	it("accepts known IANA zones", () => {
		expect(isValidTimezone("UTC")).toBe(true);
		expect(isValidTimezone("America/New_York")).toBe(true);
	});

	it("rejects an unknown zone", () => {
		expect(isValidTimezone("Not/AZone")).toBe(false);
	});
});

describe("day/month/year boundaries", () => {
	it("computes start and end of day in a non-UTC zone", () => {
		// 2026-08-12T18:00:00Z is 2026-08-12 23:30 in Asia/Kolkata (UTC+05:30) — still August 12 there.
		const reference = new Date("2026-08-12T18:00:00Z");
		const start = startOfDay(reference, "Asia/Kolkata");
		const end = endOfDay(reference, "Asia/Kolkata");

		expect(new Date(start).toISOString()).toBe("2026-08-11T18:30:00.000Z");
		expect(new Date(end).toISOString()).toBe("2026-08-12T18:29:59.999Z");
	});

	it("computes start and end of month, respecting month length", () => {
		const reference = new Date("2026-08-15T12:00:00Z");
		const start = startOfMonth(reference, "UTC");
		const end = endOfMonth(reference, "UTC");

		expect(new Date(start).toISOString()).toBe("2026-08-01T00:00:00.000Z");
		expect(new Date(end).toISOString()).toBe("2026-08-31T23:59:59.999Z");
	});

	it("computes start and end of a leap-year February", () => {
		const reference = new Date("2024-02-10T12:00:00Z");
		expect(new Date(endOfMonth(reference, "UTC")).toISOString()).toBe("2024-02-29T23:59:59.999Z");
	});

	it("computes start and end of year", () => {
		const reference = new Date("2026-06-15T12:00:00Z");
		expect(new Date(startOfYear(reference, "UTC")).toISOString()).toBe("2026-01-01T00:00:00.000Z");
		expect(new Date(endOfYear(reference, "UTC")).toISOString()).toBe("2026-12-31T23:59:59.999Z");
	});
});
