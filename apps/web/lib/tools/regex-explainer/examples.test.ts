import { describe, expect, it } from "vitest";

import { EXPLAINER_EXAMPLES } from "./examples";
import { parseRegexPattern } from "./parser";

describe("EXPLAINER_EXAMPLES", () => {
	it("has a unique id per example", () => {
		const ids = EXPLAINER_EXAMPLES.map(example => example.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	for (const example of EXPLAINER_EXAMPLES) {
		describe(example.id, () => {
			it("parses successfully with the explainer's own parser", () => {
				const result = parseRegexPattern(example.pattern, example.flags);
				expect(result.success).toBe(true);
			});

			it("actually matches its own test input", () => {
				const regex = new RegExp(example.pattern, example.flags);
				expect(regex.test(example.testInput)).toBe(true);
			});
		});
	}
});
