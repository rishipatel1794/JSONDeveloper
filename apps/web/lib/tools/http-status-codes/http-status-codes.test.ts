import { describe, expect, it } from "vitest";

import { buildFrameworkExamples } from "./codeExamples";
import { getStatusCode, STATUS_CODES } from "./data";
import { filterByCategory, searchStatusCodes } from "./search";

describe("STATUS_CODES data integrity", () => {
	it("has no duplicate codes", () => {
		const codes = STATUS_CODES.map(entry => entry.code);
		expect(new Set(codes).size).toBe(codes.length);
	});

	it("assigns a category matching the code's leading digit", () => {
		const expected: Record<string, string> = { "1": "informational", "2": "success", "3": "redirection", "4": "client-error", "5": "server-error" };

		for (const entry of STATUS_CODES) {
			const leadingDigit = String(entry.code)[0] as string;
			expect(entry.category).toBe(expected[leadingDigit]);
		}
	});

	it("gives every entry a non-empty title, description, whenToUse, and developerTip", () => {
		for (const entry of STATUS_CODES) {
			expect(entry.title.length).toBeGreaterThan(0);
			expect(entry.description.length).toBeGreaterThan(0);
			expect(entry.whenToUse.length).toBeGreaterThan(0);
			expect(entry.developerTip.length).toBeGreaterThan(0);
			expect(entry.commonCauses.length).toBeGreaterThan(0);
		}
	});

	it("marks 418 and 305 as non-standard", () => {
		expect(getStatusCode(418)?.standardStatus).toBe(false);
		expect(getStatusCode(305)?.standardStatus).toBe(false);
	});

	it("marks common codes as standard", () => {
		expect(getStatusCode(200)?.standardStatus).toBe(true);
		expect(getStatusCode(404)?.standardStatus).toBe(true);
	});
});

describe("searchStatusCodes", () => {
	it("returns everything for an empty query", () => {
		expect(searchStatusCodes(STATUS_CODES, "")).toHaveLength(STATUS_CODES.length);
	});

	it("finds an exact numeric code", () => {
		const results = searchStatusCodes(STATUS_CODES, "404");
		expect(results.some(entry => entry.code === 404)).toBe(true);
	});

	it("finds a partial numeric match across codes sharing digits", () => {
		const results = searchStatusCodes(STATUS_CODES, "50");
		expect(results.some(entry => entry.code === 500)).toBe(true);
		expect(results.some(entry => entry.code === 502)).toBe(true);
	});

	it("finds a code by keyword in its title", () => {
		const results = searchStatusCodes(STATUS_CODES, "unauthorized");
		expect(results.map(entry => entry.code)).toContain(401);
	});

	it("finds a code by keyword in its description", () => {
		const results = searchStatusCodes(STATUS_CODES, "rate limit");
		expect(results.map(entry => entry.code)).toContain(429);
	});

	it("finds a code by a multi-word phrase spanning title words", () => {
		const results = searchStatusCodes(STATUS_CODES, "gateway timeout");
		expect(results.map(entry => entry.code)).toContain(504);
	});

	it("returns no results for a nonsense query", () => {
		expect(searchStatusCodes(STATUS_CODES, "zzzznonexistentquery")).toHaveLength(0);
	});
});

describe("filterByCategory", () => {
	it("returns everything for 'all'", () => {
		expect(filterByCategory(STATUS_CODES, "all")).toHaveLength(STATUS_CODES.length);
	});

	it("returns only 4xx codes for client-error", () => {
		const results = filterByCategory(STATUS_CODES, "client-error");
		expect(results.length).toBeGreaterThan(0);
		for (const entry of results) {
			expect(entry.code).toBeGreaterThanOrEqual(400);
			expect(entry.code).toBeLessThan(500);
		}
	});
});

describe("buildFrameworkExamples", () => {
	it("returns Express.js, Laravel, and Spring Boot examples when an apiExample exists", () => {
		const examples = buildFrameworkExamples(getStatusCode(201)!);
		expect(examples.map(example => example.platform)).toEqual(["Express.js", "Laravel", "Spring Boot"]);
		expect(examples[0]!.code).toContain("app.post");
		expect(examples[0]!.code).toContain("201");
	});

	it("returns an empty array when there is no apiExample", () => {
		const examples = buildFrameworkExamples(getStatusCode(100)!);
		expect(examples).toEqual([]);
	});

	it("handles a bodyless example without a body argument", () => {
		const examples = buildFrameworkExamples(getStatusCode(204)!);
		expect(examples[0]!.code).toContain("res.status(204).end()");
	});
});
