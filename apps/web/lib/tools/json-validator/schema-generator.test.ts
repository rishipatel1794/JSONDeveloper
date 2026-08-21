import { describe, expect, it } from "vitest";

import { generateJsonSchema } from "./schema-generator";

describe("generateJsonSchema", () => {
	it("uses the draft 2020-12 dialect", () => {
		const schema = generateJsonSchema({ id: 1 });
		expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
	});

	it("distinguishes integers from other numbers", () => {
		const schema = generateJsonSchema({ id: 1, price: 9.99 }) as { properties: Record<string, { type: string }> };
		expect(schema.properties.id?.type).toBe("integer");
		expect(schema.properties.price?.type).toBe("number");
	});

	it("marks every present key as required", () => {
		const schema = generateJsonSchema({ id: 1, name: "Rishi" }) as { required: string[] };
		expect(schema.required.sort()).toEqual(["id", "name"]);
	});

	it("describes array items", () => {
		const schema = generateJsonSchema({ tags: ["a", "b"] }) as { properties: Record<string, { type: string; items: { type: string } }> };
		expect(schema.properties.tags?.type).toBe("array");
		expect(schema.properties.tags?.items.type).toBe("string");
	});

	it("describes nested objects inline", () => {
		const schema = generateJsonSchema({ user: { name: "Rishi" } }) as {
			properties: Record<string, { type: string; properties: Record<string, { type: string }> }>;
		};
		expect(schema.properties.user?.type).toBe("object");
		expect(schema.properties.user?.properties.name?.type).toBe("string");
	});
});
