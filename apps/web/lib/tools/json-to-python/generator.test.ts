import { describe, expect, it } from "vitest";

import { generatePython } from "./generator";

describe("generatePython", () => {
	it("generates a simple dataclass", () => {
		const output = generatePython({ name: "Ada", age: 30, active: true });

		expect(output).toContain("from dataclasses import dataclass");
		expect(output).toContain("@dataclass\nclass Root:");
		expect(output).toContain("    name: str");
		expect(output).toContain("    age: float");
		expect(output).toContain("    active: bool");
	});

	it("nests object properties as their own dataclass", () => {
		const output = generatePython({ user: { id: 1, address: { city: "NY" } } });

		expect(output).toContain("class Address:");
		expect(output).toContain("class User:");
		expect(output).toContain("    address: Address");
	});

	it("puts optional fields (with default None) after required fields", () => {
		const output = generatePython([{ id: 1, nickname: "a" }, { id: 2 }]);

		const classBody = output.slice(output.indexOf("class Root:"));
		const idIndex = classBody.indexOf("id: float");
		const nicknameIndex = classBody.indexOf("nickname:");
		expect(idIndex).toBeLessThan(nicknameIndex);
		expect(classBody).toContain("nickname: Optional[str] = None");
		expect(output).toContain("from typing import Optional");
	});

	it("renders arrays as List[...]", () => {
		const output = generatePython({ tags: ["a", "b"] });

		expect(output).toContain("tags: List[str]");
		expect(output).toContain("from typing import List");
	});

	it("renders a union for differing types at the same key", () => {
		const output = generatePython([{ value: 1 }, { value: "a" }]);

		expect(output).toContain("Union[");
		expect(output).toContain("from typing import Union");
	});

	it("emits a RootList alias when the root value is an array of primitives", () => {
		const output = generatePython([1, 2, 3]);

		expect(output).toContain("RootList = List[float]");
	});

	it("uses a custom root name", () => {
		const output = generatePython({ id: 1 }, "User");

		expect(output).toContain("class User:");
	});
});
