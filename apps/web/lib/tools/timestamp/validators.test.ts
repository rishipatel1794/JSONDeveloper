import { describe, expect, it } from "vitest";

import { bigFloorDiv, isWithinDateRange, parseDateOnlyString, parseIntegerString, parseTimeOfDayString } from "./validators";

describe("parseIntegerString", () => {
	it("parses zero, positive, and negative integers", () => {
		expect(parseIntegerString("0")).toEqual({ valid: true, value: 0n });
		expect(parseIntegerString("1")).toEqual({ valid: true, value: 1n });
		expect(parseIntegerString("-1")).toEqual({ valid: true, value: -1n });
		expect(parseIntegerString("1755000000")).toEqual({ valid: true, value: 1755000000n });
	});

	it("rejects empty input", () => {
		expect(parseIntegerString("").valid).toBe(false);
		expect(parseIntegerString("   ").valid).toBe(false);
	});

	it("rejects non-numeric input", () => {
		expect(parseIntegerString("abc").valid).toBe(false);
		expect(parseIntegerString("123abc").valid).toBe(false);
		expect(parseIntegerString("NaN").valid).toBe(false);
		expect(parseIntegerString("Infinity").valid).toBe(false);
	});

	it("rejects decimal input", () => {
		expect(parseIntegerString("1.5").valid).toBe(false);
	});

	it("handles extremely large numbers without losing precision", () => {
		const huge = "123456789012345678901234567890";
		const parsed = parseIntegerString(huge);
		expect(parsed.valid).toBe(true);
		expect(parsed.value).toBe(BigInt(huge));
	});
});

describe("isWithinDateRange", () => {
	it("accepts the JS Date boundary values", () => {
		expect(isWithinDateRange(8_640_000_000_000_000n)).toBe(true);
		expect(isWithinDateRange(-8_640_000_000_000_000n)).toBe(true);
	});

	it("rejects values just outside the boundary", () => {
		expect(isWithinDateRange(8_640_000_000_000_001n)).toBe(false);
		expect(isWithinDateRange(-8_640_000_000_000_001n)).toBe(false);
	});
});

describe("bigFloorDiv", () => {
	it("matches truncating division for positive operands", () => {
		expect(bigFloorDiv(7n, 2n)).toBe(3n);
	});

	it("floors (rounds toward -Infinity) for negative operands, unlike native BigInt division", () => {
		expect(bigFloorDiv(-1n, 1000n)).toBe(-1n);
		expect(bigFloorDiv(-1000n, 1000n)).toBe(-1n);
		expect(bigFloorDiv(-1001n, 1000n)).toBe(-2n);
	});
});

describe("parseDateOnlyString", () => {
	it("accepts valid calendar dates", () => {
		expect(parseDateOnlyString("2026-08-12")).toEqual({ valid: true, year: 2026, month: 8, day: 12 });
	});

	it("accepts a leap day", () => {
		expect(parseDateOnlyString("2024-02-29").valid).toBe(true);
	});

	it("rejects a non-existent leap day", () => {
		expect(parseDateOnlyString("2026-02-29").valid).toBe(false);
	});

	it("rejects a day that doesn't exist in the given month", () => {
		expect(parseDateOnlyString("2026-04-31").valid).toBe(false);
	});

	it("rejects malformed strings", () => {
		expect(parseDateOnlyString("not-a-date").valid).toBe(false);
		expect(parseDateOnlyString("2026/08/12").valid).toBe(false);
	});
});

describe("parseTimeOfDayString", () => {
	it("accepts HH:mm", () => {
		expect(parseTimeOfDayString("17:30")).toEqual({ valid: true, hour: 17, minute: 30, second: 0, millisecond: 0 });
	});

	it("accepts HH:mm:ss.SSS", () => {
		expect(parseTimeOfDayString("17:30:00.123")).toEqual({ valid: true, hour: 17, minute: 30, second: 0, millisecond: 123 });
	});

	it("rejects an out-of-range hour", () => {
		expect(parseTimeOfDayString("24:00:00").valid).toBe(false);
	});

	it("rejects malformed strings", () => {
		expect(parseTimeOfDayString("abc").valid).toBe(false);
	});
});
