import { describe, expect, it } from "vitest";

import { generateZod } from "./zod-generator";

describe("generateZod", () => {
	it("generates a flat object schema with the zod import", () => {
		const output = generateZod({ id: 1, name: "Rishi", active: true });

		expect(output).toContain('import { z } from "zod";');
		expect(output).toContain("const RootSchema = z.object({\n  id: z.number(),\n  name: z.string(),\n  active: z.boolean(),\n});");
	});

	it("generates nested schemas referencing each other", () => {
		const output = generateZod({ id: 1, user: { name: "Rishi" } });

		expect(output).toContain("const UserSchema = z.object({\n  name: z.string(),\n});");
		expect(output).toContain("user: UserSchema,");
		expect(output.indexOf("UserSchema = z.object")).toBeLessThan(output.indexOf("RootSchema = z.object"));
	});

	it("wraps array fields in z.array()", () => {
		const output = generateZod({ roles: ["admin", "developer"] });
		expect(output).toContain("roles: z.array(z.string()),");
	});

	it("generates an element schema plus a list schema for an array root", () => {
		const output = generateZod([{ id: 1 }]);
		expect(output).toContain("const RootSchema = z.object({\n  id: z.number(),\n});");
		expect(output).toContain("const RootListSchema = z.array(RootSchema);");
	});
});
