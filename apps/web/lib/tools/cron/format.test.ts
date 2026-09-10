import { describe, expect, it } from "vitest";

import { parseCronString, toCronString } from "./format";

describe("parseCronString", () => {
	it.each([
		["*/5 * * * *", { minute: "*/5", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" }],
		["0 9 * * *", { minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "*" }],
		["0 9 * * 1-5", { minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1-5" }],
		["0 0 1 * *", { minute: "0", hour: "0", dayOfMonth: "1", month: "*", dayOfWeek: "*" }],
		["0 0 * * 0", { minute: "0", hour: "0", dayOfMonth: "*", month: "*", dayOfWeek: "0" }],
	])("parses %s", (input, expected) => {
		const result = parseCronString(input);
		expect(result.valid).toBe(true);
		expect(result.expression).toEqual(expected);
	});

	it("round-trips through toCronString", () => {
		for (const input of ["*/5 * * * *", "0 9 * * *", "0 9 * * 1-5", "0 0 1 * *", "0 0 * * 0"]) {
			const result = parseCronString(input);
			expect(toCronString(result.expression!)).toBe(input);
		}
	});

	it("rejects an expression with the wrong number of fields", () => {
		expect(parseCronString("* * * *").valid).toBe(false);
		expect(parseCronString("* * * * * *").valid).toBe(false);
		expect(parseCronString("").valid).toBe(false);
	});

	it("rejects an out-of-range value", () => {
		const result = parseCronString("60 * * * *");
		expect(result.valid).toBe(false);
		expect(result.errors[0]?.field).toBe("minute");
	});

	it("rejects a malformed field", () => {
		expect(parseCronString("abc * * * *").valid).toBe(false);
		expect(parseCronString("* * * * 8").valid).toBe(false);
		expect(parseCronString("5-2 * * * *").valid).toBe(false);
	});

	it("accepts day-of-week 7 as Sunday", () => {
		expect(parseCronString("0 0 * * 7").valid).toBe(true);
	});

	it("accepts comma lists, ranges, and stepped ranges", () => {
		expect(parseCronString("0,30 * * * *").valid).toBe(true);
		expect(parseCronString("* 9-17 * * *").valid).toBe(true);
		expect(parseCronString("*/15 9-17 * * 1-5").valid).toBe(true);
	});
});
