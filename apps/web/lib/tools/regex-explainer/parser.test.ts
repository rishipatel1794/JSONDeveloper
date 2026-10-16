import { describe, expect, it } from "vitest";

import { parseRegexPattern } from "./parser";

describe("parseRegexPattern", () => {
	it("parses a simple pattern successfully", () => {
		const result = parseRegexPattern("^[A-Z]{2}\\d{4}$", "");
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.pattern.type).toBe("Pattern");
			expect(result.pattern.alternatives.length).toBe(1);
		}
	});

	it("parses lookaheads, lookbehinds, named groups, and backreferences", () => {
		const result = parseRegexPattern("(?<year>\\d{4})-(?=\\d)(?<!x)\\k<year>", "");
		expect(result.success).toBe(true);
	});

	it("fails on unmatched parentheses with a clear error", () => {
		const result = parseRegexPattern("(abc", "");
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.length).toBeGreaterThan(0);
		}
	});

	it("fails on an invalid quantifier", () => {
		const result = parseRegexPattern("a{5,2}", "");
		expect(result.success).toBe(false);
	});

	it("fails on an unterminated character class", () => {
		const result = parseRegexPattern("[a-z", "");
		expect(result.success).toBe(false);
	});

	it("parses unicode property escapes when the u flag is set", () => {
		const result = parseRegexPattern("\\p{Letter}+", "u");
		expect(result.success).toBe(true);
	});
});
