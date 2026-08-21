import { describe, expect, it } from "vitest";

import { detectKind } from "./detector";

describe("detectKind", () => {
	it("detects Unix seconds for a 10-digit number", () => {
		expect(detectKind("1755000000")).toBe("unix-seconds");
	});

	it("detects Unix milliseconds for a 13-digit number", () => {
		expect(detectKind("1755000000000")).toBe("unix-milliseconds");
	});

	it("detects Unix microseconds for a 16-digit number", () => {
		expect(detectKind("1755000000000000")).toBe("unix-microseconds");
	});

	it("detects Unix nanoseconds for a 19-digit number", () => {
		expect(detectKind("1755000000000000000")).toBe("unix-nanoseconds");
	});

	it("treats 0 and small negative numbers as seconds", () => {
		expect(detectKind("0")).toBe("unix-seconds");
		expect(detectKind("-1")).toBe("unix-seconds");
	});

	it("detects ISO 8601 with a Z suffix", () => {
		expect(detectKind("2026-08-12T12:30:00Z")).toBe("iso");
	});

	it("detects ISO 8601 with a numeric offset", () => {
		expect(detectKind("2026-08-12T18:00:00+05:30")).toBe("iso");
	});

	it("detects a naive date/time as datetime", () => {
		expect(detectKind("2026-08-12 17:30:00")).toBe("datetime");
		expect(detectKind("2026-08-12")).toBe("datetime");
	});

	it("classifies unparseable text as invalid", () => {
		expect(detectKind("abc")).toBe("invalid");
		expect(detectKind("123abc")).toBe("invalid");
		expect(detectKind("")).toBe("invalid");
		expect(detectKind("   ")).toBe("invalid");
		expect(detectKind("NaN")).toBe("invalid");
		expect(detectKind("Infinity")).toBe("invalid");
	});
});
