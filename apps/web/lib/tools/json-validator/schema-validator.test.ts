import { describe, expect, it } from "vitest";

import { validateAgainstSchema } from "./schema-validator";

describe("validateAgainstSchema", () => {
	it("passes a matching document", () => {
		const result = validateAgainstSchema(
			{ name: "Rishi", age: 25 },
			{
				type: "object",
				properties: { name: { type: "string" }, age: { type: "number" } },
				required: ["name", "age"],
			},
		);

		expect(result.valid).toBe(true);
		expect(result.issues).toHaveLength(0);
	});

	it("reports type mismatches with expected/received and the property path", () => {
		const result = validateAgainstSchema(
			{ name: 123, age: "25" },
			{
				type: "object",
				properties: { name: { type: "string" }, age: { type: "number" } },
			},
		);

		expect(result.valid).toBe(false);
		expect(result.issues).toHaveLength(2);

		const byPath = Object.fromEntries(result.issues.map(issue => [issue.path, issue]));
		expect(byPath.name).toMatchObject({ expected: "string", received: "number" });
		expect(byPath.age).toMatchObject({ expected: "number", received: "string" });
	});

	it("reports a missing required property", () => {
		const result = validateAgainstSchema({ age: 25 }, { type: "object", required: ["name"] });
		expect(result.valid).toBe(false);
		expect(result.issues[0]).toMatchObject({ path: "name", keyword: "required" });
	});

	it("validates array items", () => {
		const result = validateAgainstSchema({ tags: ["a", 1] }, { type: "object", properties: { tags: { type: "array", items: { type: "string" } } } });
		expect(result.valid).toBe(false);
		expect(result.issues[0]?.path).toBe("tags[1]");
	});

	it("flags additional properties when additionalProperties is false", () => {
		const result = validateAgainstSchema(
			{ name: "Rishi", extra: true },
			{ type: "object", properties: { name: { type: "string" } }, additionalProperties: false },
		);
		expect(result.valid).toBe(false);
		expect(result.issues[0]).toMatchObject({ path: "extra", keyword: "additionalProperties" });
	});

	it("validates enum and const", () => {
		expect(validateAgainstSchema("b", { enum: ["a", "b", "c"] }).valid).toBe(true);
		expect(validateAgainstSchema("z", { enum: ["a", "b", "c"] }).valid).toBe(false);
		expect(validateAgainstSchema(5, { const: 5 }).valid).toBe(true);
		expect(validateAgainstSchema(6, { const: 5 }).valid).toBe(false);
	});

	it("validates numeric bounds", () => {
		expect(validateAgainstSchema(5, { type: "number", minimum: 1, maximum: 10 }).valid).toBe(true);
		expect(validateAgainstSchema(15, { type: "number", minimum: 1, maximum: 10 }).valid).toBe(false);
	});

	it("validates nested objects recursively", () => {
		const result = validateAgainstSchema(
			{ user: { age: "25" } },
			{ type: "object", properties: { user: { type: "object", properties: { age: { type: "number" } } } } },
		);
		expect(result.valid).toBe(false);
		expect(result.issues[0]?.path).toBe("user.age");
	});

	it("supports oneOf", () => {
		const schema = { oneOf: [{ type: "string" }, { type: "number" }] };
		expect(validateAgainstSchema("x", schema).valid).toBe(true);
		expect(validateAgainstSchema(1, schema).valid).toBe(true);
		expect(validateAgainstSchema(true, schema).valid).toBe(false);
	});
});
