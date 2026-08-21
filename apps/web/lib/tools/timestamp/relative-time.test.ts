import { describe, expect, it } from "vitest";

import { getRelativeTime } from "./relative-time";

const NOW = Date.parse("2026-08-12T12:00:00Z");

describe("getRelativeTime", () => {
	it("reports 'just now' for the present instant and small deltas", () => {
		expect(getRelativeTime(NOW, NOW)).toEqual({ label: "just now", direction: "present" });
		expect(getRelativeTime(NOW + 5_000, NOW).direction).toBe("present");
	});

	it("reports minutes in the past", () => {
		const result = getRelativeTime(NOW - 5 * 60_000, NOW);
		expect(result.direction).toBe("past");
		expect(result.label).toBe("5 minutes ago");
	});

	it("reports hours in the past", () => {
		const result = getRelativeTime(NOW - 2 * 60 * 60_000, NOW);
		expect(result.direction).toBe("past");
		expect(result.label).toBe("2 hours ago");
	});

	it("reports days in the past", () => {
		const result = getRelativeTime(NOW - 3 * 24 * 60 * 60_000, NOW);
		expect(result.direction).toBe("past");
		expect(result.label).toBe("3 days ago");
	});

	it("reports the future with 'in' phrasing", () => {
		const hours = getRelativeTime(NOW + 2 * 60 * 60_000, NOW);
		expect(hours.direction).toBe("future");
		expect(hours.label).toBe("in 2 hours");

		const days = getRelativeTime(NOW + 5 * 24 * 60 * 60_000, NOW);
		expect(days.direction).toBe("future");
		expect(days.label).toBe("in 5 days");
	});
});
