import { describe, expect, it } from "vitest";

import { parseRegexPattern } from "./parser";
import { tokenizePattern } from "./tokenize";

function tokenize(pattern: string, flags = "") {
	const result = parseRegexPattern(pattern, flags);
	if (!result.success) throw new Error(`Failed to parse: ${result.error}`);
	return tokenizePattern(result.pattern);
}

describe("tokenizePattern", () => {
	it("produces exactly 4 tokens for ^[A-Z]{2}\\d{4}$, in source order", () => {
		const rows = tokenize("^[A-Z]{2}\\d{4}$");
		expect(rows.map(r => r.raw)).toEqual(["^", "[A-Z]{2}", "\\d{4}", "$"]);
		expect(rows[0]!.type).toBe("Anchor");
		expect(rows[1]!.type).toContain("quantified");
		expect(rows[1]!.meaning).toContain("exactly 2");
		expect(rows[2]!.meaning).toContain("exactly 4");
		expect(rows[3]!.type).toBe("Anchor");
	});

	it("attaches a quantifier to its preceding element, not the next one", () => {
		const rows = tokenize("a+b");
		expect(rows).toHaveLength(2);
		expect(rows[0]!.raw).toBe("a+");
		expect(rows[0]!.meaning).toContain("one or more");
		expect(rows[1]!.raw).toBe("b");
	});

	it("distinguishes greedy from lazy quantifiers", () => {
		const greedy = tokenize("a+");
		const lazy = tokenize("a+?");
		expect(greedy[0]!.meaning).not.toContain("lazy");
		expect(lazy[0]!.meaning).toContain("lazy");
	});

	it("represents alternation as its own row between branches", () => {
		const rows = tokenize("cat|dog");
		const types = rows.map(r => r.type);
		expect(types).toContain("Alternation");
	});

	it("descends into a capturing group and reports nested depth", () => {
		const rows = tokenize("a(bc)d");
		const groupRow = rows.find(r => r.type.includes("Capturing group"));
		expect(groupRow).toBeDefined();
		expect(groupRow!.depth).toBe(0);
		const nested = rows.filter(r => r.depth === 1);
		expect(nested.map(r => r.raw)).toEqual(["b", "c"]);
	});

	it("labels a named capturing group with its name", () => {
		const rows = tokenize("(?<year>\\d{4})");
		const groupRow = rows.find(r => r.type.includes("Capturing group"));
		expect(groupRow!.type).toContain("year");
	});

	it("distinguishes non-capturing groups", () => {
		const rows = tokenize("(?:abc)");
		expect(rows.find(r => r.type === "Non-capturing group")).toBeDefined();
	});

	it("handles positive and negative lookahead", () => {
		const positive = tokenize("a(?=b)");
		const negative = tokenize("a(?!b)");
		expect(positive.find(r => r.type === "Positive lookahead")).toBeDefined();
		expect(negative.find(r => r.type === "Negative lookahead")).toBeDefined();
	});

	it("handles positive and negative lookbehind", () => {
		const positive = tokenize("(?<=a)b");
		const negative = tokenize("(?<!a)b");
		expect(positive.find(r => r.type === "Positive lookbehind")).toBeDefined();
		expect(negative.find(r => r.type === "Negative lookbehind")).toBeDefined();
	});

	it("describes a backreference by its referenced group", () => {
		const rows = tokenize("(a)\\1");
		const backref = rows.find(r => r.type === "Backreference");
		expect(backref!.meaning).toContain("group #1");
	});

	it("describes shorthand character classes including negated forms", () => {
		const digit = tokenize("\\d");
		const notDigit = tokenize("\\D");
		const word = tokenize("\\w");
		const space = tokenize("\\s");
		expect(digit[0]!.meaning).toContain("digit");
		expect(notDigit[0]!.meaning).toContain("NOT a digit");
		expect(word[0]!.meaning).toMatch(/word/);
		expect(space[0]!.meaning).toMatch(/whitespace/);
	});

	it("describes a negated character class", () => {
		const rows = tokenize("[^0-9]");
		expect(rows[0]!.type).toBe("Negated character class");
	});

	it("describes a character class range", () => {
		const rows = tokenize("[a-z]");
		expect(rows[0]!.matches).toContain("a");
		expect(rows[0]!.matches).toContain("z");
	});

	it("describes word boundary and non-boundary assertions", () => {
		const boundary = tokenize("\\bcat\\b");
		const nonBoundary = tokenize("\\Bcat");
		expect(boundary[0]!.type).toBe("Boundary");
		expect(nonBoundary[0]!.meaning).toContain("NOT a word boundary");
	});

	it("quantifies an entire group and still reports its nested contents", () => {
		const rows = tokenize("(abc)+");
		const quantifiedGroup = rows.find(r => r.type.includes("quantified"));
		expect(quantifiedGroup).toBeDefined();
		expect(quantifiedGroup!.meaning).toContain("one or more");
		const nested = rows.filter(r => r.depth === 1);
		expect(nested.map(r => r.raw)).toEqual(["a", "b", "c"]);
	});
});
