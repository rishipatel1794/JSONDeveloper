import { describe, expect, it } from "vitest";

import { validateAndAnalyze } from "./validator";

describe("validateAndAnalyze — valid JSON", () => {
	it("accepts an empty object", () => {
		const result = validateAndAnalyze("{}");
		expect(result.valid).toBe(true);
		expect(result.statistics?.objects).toBe(1);
		expect(result.statistics?.keys).toBe(0);
	});

	it("accepts an empty array", () => {
		const result = validateAndAnalyze("[]");
		expect(result.valid).toBe(true);
		expect(result.statistics?.arrays).toBe(1);
	});

	it("accepts a simple object", () => {
		const result = validateAndAnalyze('{"name": "Rishi"}');
		expect(result.valid).toBe(true);
		expect(result.value).toEqual({ name: "Rishi" });
	});

	it("accepts nested objects", () => {
		const result = validateAndAnalyze('{"user": {"profile": {"address": {"city": "Ahmedabad"}}}}');
		expect(result.valid).toBe(true);
		expect(result.statistics?.maxDepth).toBe(4);
	});

	it("accepts nested arrays", () => {
		const result = validateAndAnalyze("[[1, 2], [3, [4, 5]]]");
		expect(result.valid).toBe(true);
		expect(result.statistics?.arrays).toBe(4);
		expect(result.statistics?.numbers).toBe(5);
	});

	it("accepts mixed types", () => {
		const result = validateAndAnalyze('{"id": 1, "name": "Rishi", "active": true, "tags": ["developer"], "profile": null}');
		expect(result.valid).toBe(true);
		expect(result.statistics).toMatchObject({
			objects: 1,
			arrays: 1,
			keys: 5,
			strings: 2,
			numbers: 1,
			booleans: 1,
			nulls: 1,
		});
		expect(result.statistics?.maxDepth).toBe(2);
	});
});

describe("validateAndAnalyze — invalid JSON", () => {
	it("reports an unterminated object", () => {
		const result = validateAndAnalyze("{");
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
	});

	it("reports single quotes with a friendly explanation", () => {
		const result = validateAndAnalyze("{'name': 'Rishi'}");
		expect(result.valid).toBe(false);
		expect(result.error?.friendlyMessage).toMatch(/double quotes/i);
	});

	it("reports a trailing comma with a friendly explanation and location", () => {
		const result = validateAndAnalyze('{\n  "name": "Rishi",\n}');
		expect(result.valid).toBe(false);
		expect(result.error?.friendlyMessage).toMatch(/trailing comma/i);
		expect(result.error?.line).toBe(3);
	});

	it("reports a missing comma between properties with a friendly explanation", () => {
		const result = validateAndAnalyze('{\n  "name": "Rishi"\n  "age": 25\n}');
		expect(result.valid).toBe(false);
		expect(result.error?.friendlyMessage).toMatch(/expected ','/i);
		expect(result.error?.line).toBe(3);
	});

	it("never throws for garbage input", () => {
		expect(() => validateAndAnalyze("not json at all }{[[")).not.toThrow();
		expect(() => validateAndAnalyze("")).not.toThrow();
		expect(() => validateAndAnalyze("   ")).not.toThrow();
	});
});

describe("validateAndAnalyze — duplicate keys", () => {
	it("detects a duplicate key at the root", () => {
		const result = validateAndAnalyze('{\n  "name": "Rishi",\n  "name": "Patel"\n}');
		expect(result.valid).toBe(true);
		expect(result.duplicates).toHaveLength(1);
		expect(result.duplicates[0]).toMatchObject({ key: "name", path: "" });
		expect(result.duplicates[0]?.locations.map(l => l.line)).toEqual([2, 3]);
	});

	it("detects multiple duplicate keys", () => {
		const result = validateAndAnalyze(
			'{\n  "name": "Rishi",\n  "name": "Patel",\n  "email": "a@example.com",\n  "email": "b@example.com"\n}',
		);
		expect(result.valid).toBe(true);
		expect(result.duplicates).toHaveLength(2);
		expect(result.duplicates.map(d => d.key).sort()).toEqual(["email", "name"]);
	});

	it("does not flag unique keys as duplicates", () => {
		const result = validateAndAnalyze('{"name": "Rishi", "age": 25}');
		expect(result.duplicates).toHaveLength(0);
	});

	it("scopes duplicate detection per-object (same key in different objects is fine)", () => {
		const result = validateAndAnalyze('{"a": {"name": "x"}, "b": {"name": "y"}}');
		expect(result.duplicates).toHaveLength(0);
	});
});

describe("validateAndAnalyze — statistics", () => {
	it("counts every node kind for a representative document", () => {
		const result = validateAndAnalyze(
			JSON.stringify({
				id: 1,
				name: "Rishi",
				active: true,
				tags: ["developer"],
				profile: null,
			}),
		);

		expect(result.statistics).toMatchObject({
			objects: 1,
			arrays: 1,
			keys: 5,
			strings: 2,
			numbers: 1,
			booleans: 1,
			nulls: 1,
			totalNodes: 7,
		});
	});

	it("computes UTF-8 byte size, not character count", () => {
		const result = validateAndAnalyze('{"emoji": "🚀"}');
		expect(result.statistics?.sizeBytes).toBeGreaterThan('{"emoji": "🚀"}'.length);
	});
});
