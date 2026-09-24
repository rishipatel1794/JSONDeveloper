import { describe, expect, it } from "vitest";

import { computeOverallScore, scoreCategories, scoreToRating, summarizeFindings } from "./scoring";
import type { Finding } from "./types";

function finding(overrides: Partial<Finding>): Finding {
	return {
		id: "test",
		title: "Test",
		category: "Security Headers",
		severity: "INFO",
		description: "",
		impact: "",
		recommendation: "",
		evidence: {},
		...overrides,
	};
}

describe("summarizeFindings", () => {
	it("counts each severity bucket", () => {
		const summary = summarizeFindings([
			finding({ severity: "CRITICAL" }),
			finding({ severity: "HIGH" }),
			finding({ severity: "HIGH" }),
			finding({ severity: "MEDIUM" }),
			finding({ severity: "LOW" }),
			finding({ severity: "INFO" }),
			finding({ severity: "PASS" }),
		]);
		expect(summary).toEqual({ critical: 1, high: 2, medium: 1, low: 1, info: 1, passed: 1 });
	});
});

describe("scoreCategories", () => {
	it("gives an untouched category a perfect score", () => {
		const categories = scoreCategories([]);
		expect(categories["HTTPS"]!.score).toBe(100);
	});

	it("deducts points proportional to severity within a category", () => {
		const categories = scoreCategories([finding({ category: "Cookies", severity: "HIGH" })]);
		expect(categories["Cookies"]!.score).toBe(75); // 100 - 25
	});

	it("never drops a category score below zero", () => {
		const categories = scoreCategories([
			finding({ category: "Cookies", severity: "CRITICAL" }),
			finding({ category: "Cookies", severity: "CRITICAL" }),
			finding({ category: "Cookies", severity: "CRITICAL" }),
		]);
		expect(categories["Cookies"]!.score).toBe(0);
	});

	it("does not let PASS/INFO findings deduct anything", () => {
		const categories = scoreCategories([finding({ category: "CORS", severity: "PASS" }), finding({ category: "CORS", severity: "INFO" })]);
		expect(categories["CORS"]!.score).toBe(100);
	});
});

describe("computeOverallScore", () => {
	it("averages the 7 category scores", () => {
		const categories = scoreCategories([]);
		expect(computeOverallScore(categories)).toBe(100);
	});
});

describe("scoreToRating", () => {
	it.each([
		[95, "Excellent"],
		[82, "Good"],
		[60, "Fair"],
		[20, "Poor"],
	])("maps %i to %s", (score, expected) => {
		expect(scoreToRating(score)).toBe(expected);
	});
});
