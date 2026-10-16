import { describe, expect, it } from "vitest";

import { detectPotentialCatastrophicBacktracking } from "./redosHeuristics";

describe("detectPotentialCatastrophicBacktracking", () => {
	it("flags a nested quantifier like (a+)+", () => {
		expect(detectPotentialCatastrophicBacktracking("(a+)+")).toHaveLength(1);
	});

	it("flags (a*)*", () => {
		expect(detectPotentialCatastrophicBacktracking("(a*)*")).toHaveLength(1);
	});

	it("flags a nested bounded quantifier like (\\d{1,5})+", () => {
		expect(detectPotentialCatastrophicBacktracking("(\\d{1,5})+")).toHaveLength(1);
	});

	it("flags overlapping alternation under a quantifier", () => {
		expect(detectPotentialCatastrophicBacktracking("(a|a)+")).toHaveLength(1);
	});

	it("does not flag an ordinary, safe pattern", () => {
		expect(detectPotentialCatastrophicBacktracking("^[a-z0-9]+@[a-z0-9.]+$")).toHaveLength(0);
	});

	it("does not flag a simple single quantifier", () => {
		expect(detectPotentialCatastrophicBacktracking("a+")).toHaveLength(0);
		expect(detectPotentialCatastrophicBacktracking("\\d{2,4}")).toHaveLength(0);
	});

	it("does not flag a non-quantified group", () => {
		expect(detectPotentialCatastrophicBacktracking("(abc)def")).toHaveLength(0);
	});
});
