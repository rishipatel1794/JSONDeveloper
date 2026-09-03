import { describe, expect, it } from "vitest";

import { generateJava } from "./generator";

describe("generateJava", () => {
	it("generates a class with private fields and getters/setters", () => {
		const output = generateJava({ name: "Ada", age: 30, active: true });

		expect(output).toContain("public class Root {");
		expect(output).toContain("private String name;");
		expect(output).toContain("private Double age;");
		expect(output).toContain("private Boolean active;");
		expect(output).toContain("public String getName() {");
		expect(output).toContain("public void setName(String name) {");
	});

	it("nests object properties as their own class", () => {
		const output = generateJava({ user: { id: 1, address: { city: "NY" } } });

		expect(output).toContain("public class Address {");
		expect(output).toContain("public class User {");
		expect(output).toContain("private Address address;");
	});

	it("renders arrays as List<T> and imports java.util.List", () => {
		const output = generateJava({ tags: ["a", "b"] });

		expect(output).toContain("import java.util.List;");
		expect(output).toContain("private List<String> tags;");
	});

	it("camelCases snake_case keys and notes the original JSON key", () => {
		const output = generateJava({ user_id: 1 });

		expect(output).toContain("private Double userId;");
		expect(output).toContain('// JSON key: "user_id"');
	});

	it("falls back to Object for a union of differing types", () => {
		const output = generateJava([{ value: 1 }, { value: "a" }]);

		expect(output).toContain("private Object value;");
	});

	it("uses a custom root name", () => {
		const output = generateJava({ id: 1 }, "User");

		expect(output).toContain("public class User {");
	});
});
