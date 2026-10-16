import { describe, expect, it } from "vitest";

import { inferPatternFromExamples } from "./exampleInference";

describe("inferPatternFromExamples", () => {
	it("infers a high-confidence pattern for same-length structured codes", () => {
		const result = inferPatternFromExamples(["AB12", "XY99", "CD45"]);
		expect(result.confidence).toBe("high");
		const regex = new RegExp(result.pattern);
		expect(regex.test("ZZ00")).toBe(true);
		expect(regex.test("ab12")).toBe(false);
		expect(regex.test("A123")).toBe(false);
	});

	it("keeps a literal character fixed when every example shares it at that position", () => {
		// Digits vary across all three positions here, so only the "ID-" prefix should stay literal —
		// a set with less variation (e.g. all ending the same) would correctly infer more as literal too.
		const result = inferPatternFromExamples(["ID-001", "ID-492", "ID-837"]);
		expect(result.pattern).toContain("ID-");
		const regex = new RegExp(result.pattern);
		expect(regex.test("ID-999")).toBe(true);
		expect(regex.test("XX-999")).toBe(false);
	});

	it("falls back to a literal alternation when examples have different lengths", () => {
		const result = inferPatternFromExamples(["cat", "elephant"]);
		expect(result.confidence).toBe("low");
		const regex = new RegExp(result.pattern);
		expect(regex.test("cat")).toBe(true);
		expect(regex.test("elephant")).toBe(true);
		expect(regex.test("dog")).toBe(false);
	});

	it("falls back when the generalized pattern would also match a given negative example", () => {
		// Same length and shape, but a negative example that a naive per-position class would still match.
		const result = inferPatternFromExamples(["abc", "xyz"], ["abz"]);
		expect(result.confidence).toBe("low");
		const regex = new RegExp(result.pattern);
		expect(regex.test("abz")).toBe(false);
		expect(regex.test("abc")).toBe(true);
	});

	it("returns an empty-pattern result with guidance for no examples", () => {
		const result = inferPatternFromExamples([]);
		expect(result.pattern).toBe("");
		expect(result.notes.length).toBeGreaterThan(0);
	});

	it("escapes regex-special characters in the literal fallback", () => {
		const result = inferPatternFromExamples(["a.b", "c+d"]);
		const regex = new RegExp(result.pattern);
		expect(regex.test("a.b")).toBe(true);
		expect(regex.test("aXb")).toBe(false);
	});

	it("never throws on adversarial example input", () => {
		expect(() => inferPatternFromExamples(["[", "]", "("])).not.toThrow();
		expect(() => inferPatternFromExamples(["a", "a", "a"])).not.toThrow();
	});

	it("always includes a note explaining the pattern is not a guarantee", () => {
		const highConfidence = inferPatternFromExamples(["AB", "CD"]);
		const lowConfidence = inferPatternFromExamples(["a", "bb"]);
		expect(highConfidence.notes.length).toBeGreaterThan(0);
		expect(lowConfidence.notes.length).toBeGreaterThan(0);
	});
});
