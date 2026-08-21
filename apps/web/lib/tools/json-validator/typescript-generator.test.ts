import { describe, expect, it } from "vitest";

import { generateTypeScript } from "./typescript-generator";

describe("generateTypeScript", () => {
	it("generates a flat interface", () => {
		const output = generateTypeScript({ id: 1, name: "Rishi", active: true });
		expect(output).toBe("interface Root {\n  id: number;\n  name: string;\n  active: boolean;\n}");
	});

	it("generates a nested interface, named after the property", () => {
		const output = generateTypeScript({ id: 1, user: { name: "Rishi", roles: ["admin", "developer"] } });

		expect(output).toContain("interface User {\n  name: string;\n  roles: string[];\n}");
		expect(output).toContain("interface Root {\n  id: number;\n  user: User;\n}");
		// Children are emitted before parents so there are no forward references.
		expect(output.indexOf("interface User")).toBeLessThan(output.indexOf("interface Root"));
	});

	it("generates an element interface plus a list alias for an array root", () => {
		const output = generateTypeScript([{ id: 1, name: "Rishi" }]);

		expect(output).toContain("interface Root {\n  id: number;\n  name: string;\n}");
		expect(output).toContain("type RootList = Root[];");
	});

	it("does not duplicate structurally identical nested interfaces", () => {
		const output = generateTypeScript({
			billing: { city: "Ahmedabad", zip: "380001" },
			shipping: { city: "Mumbai", zip: "400001" },
		});

		const interfaceCount = (output.match(/^interface /gm) ?? []).length;
		expect(interfaceCount).toBe(2); // one shared shape for billing/shipping + Root
	});

	it("marks fields missing from some array elements as optional", () => {
		const output = generateTypeScript([{ id: 1, nickname: "R" }, { id: 2 }]);
		expect(output).toContain("nickname?: string;");
	});
});
