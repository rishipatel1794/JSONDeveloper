import { describe, expect, it } from "vitest";

import { getNextRunTimes } from "./parser";

describe("getNextRunTimes", () => {
	it("returns the requested count of upcoming times, strictly increasing", () => {
		const from = new Date("2026-01-01T00:00:00");
		const runs = getNextRunTimes({ minute: "*/5", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" }, { from, count: 5 });

		expect(runs).toHaveLength(5);
		expect(runs[0]!.getMinutes()).toBe(5);
		for (let i = 1; i < runs.length; i++) {
			expect(runs[i]!.getTime()).toBeGreaterThan(runs[i - 1]!.getTime());
		}
	});

	it("respects a specific daily time", () => {
		const from = new Date("2026-01-01T10:00:00");
		const runs = getNextRunTimes({ minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "*" }, { from, count: 2 });

		expect(runs[0]!.getDate()).toBe(2);
		expect(runs[0]!.getHours()).toBe(9);
		expect(runs[0]!.getMinutes()).toBe(0);
	});

	it("respects a day-of-week restriction (every Monday)", () => {
		const from = new Date("2026-01-01T00:00:00"); // a Thursday
		const runs = getNextRunTimes({ minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1" }, { from, count: 1 });

		expect(runs[0]!.getDay()).toBe(1);
	});

	it("applies OR semantics when both day-of-month and day-of-week are restricted", () => {
		const from = new Date("2026-01-01T00:00:00");
		// Matches the 15th OR any Friday.
		const runs = getNextRunTimes({ minute: "0", hour: "0", dayOfMonth: "15", month: "*", dayOfWeek: "5" }, { from, count: 3 });

		for (const run of runs) {
			expect(run.getDate() === 15 || run.getDay() === 5).toBe(true);
		}
	});
});
