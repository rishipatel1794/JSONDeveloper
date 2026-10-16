import { describe, expect, it } from "vitest";

import { describePatternInPlainEnglish } from "./plainEnglish";
import { parseRegexPattern } from "./parser";

function explain(pattern: string, flags = "") {
	const result = parseRegexPattern(pattern, flags);
	if (!result.success) throw new Error(`Failed to parse: ${result.error}`);
	return describePatternInPlainEnglish(result.pattern);
}

describe("describePatternInPlainEnglish", () => {
	it("matches the spec's own worked example for ^[A-Z]{2}\\d{4}$", () => {
		const summary = explain("^[A-Z]{2}\\d{4}$");
		expect(summary).toContain("exactly two uppercase ASCII letter");
		expect(summary).toContain("followed by");
		expect(summary).toContain("exactly four digit");
		expect(summary).toMatch(/anchored to both the start and end/);
	});

	it("notes when a pattern is not anchored at all", () => {
		const summary = explain("abc");
		expect(summary).toMatch(/not anchored/);
	});

	it("notes a start-only anchor", () => {
		const summary = explain("^abc");
		expect(summary).toMatch(/anchored to the start/);
		expect(summary).not.toMatch(/start and end/);
	});

	it("notes an end-only anchor", () => {
		const summary = explain("abc$");
		expect(summary).toMatch(/anchored to the end/);
	});

	it("describes alternation with OR", () => {
		const summary = explain("^(?:cat|dog)$");
		expect(summary).toMatch(/OR/);
	});

	it("describes an optional element", () => {
		const summary = explain("colou?r");
		expect(summary).toContain("optional");
	});

	it("describes one-or-more and zero-or-more", () => {
		expect(explain("a+")).toContain("one or more");
		expect(explain("a*")).toContain("zero or more");
	});

	it("notes lazy quantifiers", () => {
		const summary = explain("a+?");
		expect(summary).toContain("as few as possible");
	});

	it("never throws for a deeply nested or unusual pattern", () => {
		expect(() => explain("(?:(?:(?:a)))")).not.toThrow();
		expect(() => explain("(?<=a)(?<!b)(?=c)(?!d)e")).not.toThrow();
	});

	it("does not overclaim validation beyond what the pattern checks", () => {
		// A pattern that only checks digit positions should never be described as validating "a date".
		const summary = explain("^\\d{4}-\\d{2}-\\d{2}$");
		expect(summary.toLowerCase()).not.toContain("date");
	});
});
