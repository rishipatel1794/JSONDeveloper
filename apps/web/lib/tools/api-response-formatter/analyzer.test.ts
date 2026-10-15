import { describe, expect, it } from "vitest";

import { analyzeApiResponse } from "./analyzer";

function ids(findings: ReturnType<typeof analyzeApiResponse>): string[] {
	return findings.map(finding => finding.id);
}

describe("analyzeApiResponse", () => {
	it("always reports valid JSON and root type for an object", () => {
		const findings = analyzeApiResponse({ id: 1 }, {}, 1);
		expect(ids(findings)).toContain("valid-json");
		expect(ids(findings)).toContain("root-type");
	});

	it("accepts a root-level array without error", () => {
		const findings = analyzeApiResponse([1, 2, 3], {}, 1);
		expect(ids(findings)).toContain("valid-json");
		expect(ids(findings)).toContain("root-type");
	});

	it("flags a primitive root value", () => {
		expect(ids(analyzeApiResponse("just a string", {}, 0))).toContain("root-primitive");
		expect(ids(analyzeApiResponse(42, {}, 0))).toContain("root-primitive");
		expect(ids(analyzeApiResponse(true, {}, 0))).toContain("root-primitive");
		expect(ids(analyzeApiResponse(null, {}, 0))).toContain("root-primitive");
	});

	it("flags an empty object and an empty array", () => {
		expect(ids(analyzeApiResponse({}, {}, 0))).toContain("empty-body");
		expect(ids(analyzeApiResponse([], {}, 0))).toContain("empty-body");
	});

	it("does not flag a non-empty, well-formed object as having any observation findings", () => {
		const findings = analyzeApiResponse({ data: { id: 1, name: "Example" } }, {}, 2);
		const observationIds = findings.filter(finding => finding.tone === "observation").map(finding => finding.id);
		expect(observationIds).toEqual([]);
	});

	it("flags an error status code with no error-shaped field", () => {
		const findings = analyzeApiResponse({ foo: "bar" }, { statusCode: 500 }, 1);
		expect(ids(findings)).toContain("error-shape-missing");
	});

	it("does not flag an error status code that includes a message field", () => {
		const findings = analyzeApiResponse({ message: "Something went wrong" }, { statusCode: 500 }, 1);
		expect(ids(findings)).not.toContain("error-shape-missing");
	});

	it("flags success:false paired with a non-error status code", () => {
		const findings = analyzeApiResponse({ success: false, data: null }, { statusCode: 200 }, 1);
		expect(ids(findings)).toContain("success-status-mismatch");
	});

	it("flags mixed naming conventions within the same object", () => {
		const findings = analyzeApiResponse({ user_name: "a", userEmail: "b" }, {}, 1);
		expect(ids(findings)).toContain("naming-inconsistency");
	});

	it("does not flag naming when every key uses the same convention", () => {
		const findings = analyzeApiResponse({ user_name: "a", user_email: "b" }, {}, 1);
		expect(ids(findings)).not.toContain("naming-inconsistency");
	});

	it("flags similarly-named fields that may be duplicates", () => {
		const findings = analyzeApiResponse({ userId: 1, user_id: 1 }, {}, 1);
		expect(ids(findings)).toContain("duplicate-looking-fields");
	});

	it("flags inconsistent field types across array items", () => {
		const findings = analyzeApiResponse({ data: [{ id: 1 }, { id: "2" }] }, {}, 2);
		expect(ids(findings)).toContain("inconsistent-item-types");
	});

	it("does not flag consistent field types across array items", () => {
		const findings = analyzeApiResponse({ data: [{ id: 1 }, { id: 2 }] }, {}, 2);
		expect(ids(findings)).not.toContain("inconsistent-item-types");
	});

	it("flags a large collection with no pagination metadata", () => {
		const items = Array.from({ length: 25 }, (_, index) => ({ id: index }));
		const findings = analyzeApiResponse(items, {}, 1);
		expect(ids(findings)).toContain("missing-pagination");
	});

	it("does not flag a large collection that has pagination metadata", () => {
		const items = Array.from({ length: 25 }, (_, index) => ({ id: index }));
		const findings = analyzeApiResponse({ data: items, meta: { page: 1, total: 100 } }, {}, 2);
		expect(ids(findings)).not.toContain("missing-pagination");
	});

	it("flags excessive nesting", () => {
		const findings = analyzeApiResponse({ a: { b: { c: { d: { e: { f: { g: { h: 1 } } } } } } } }, {}, 8);
		expect(ids(findings)).toContain("excessive-nesting");
	});

	it("flags null values with their paths", () => {
		const findings = analyzeApiResponse({ user: { email: null } }, {}, 2);
		const nullFinding = findings.find(finding => finding.id === "null-values");
		expect(nullFinding?.detail).toContain("user.email");
	});

	it("handles deeply nested input without crashing", () => {
		let deep: unknown = { leaf: true };
		for (let i = 0; i < 100; i++) deep = { nested: deep };
		expect(() => analyzeApiResponse(deep as never, {}, 100)).not.toThrow();
	});

	it("handles a large flat array without crashing", () => {
		const large = Array.from({ length: 5000 }, (_, index) => ({ id: index, name: `item ${index}` }));
		expect(() => analyzeApiResponse(large, {}, 1)).not.toThrow();
	});
});
