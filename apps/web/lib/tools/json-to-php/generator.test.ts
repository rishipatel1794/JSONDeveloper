import { describe, expect, it } from "vitest";

import { generatePhp } from "./generator";

describe("generatePhp", () => {
	it("generates a class with promoted constructor properties", () => {
		const output = generatePhp({ name: "Ada", age: 30, active: true });

		expect(output).toContain("<?php");
		expect(output).toContain("class Root");
		expect(output).toContain("public string $name,");
		expect(output).toContain("public int|float $age,");
		expect(output).toContain("public bool $active,");
	});

	it("nests object properties as their own class", () => {
		const output = generatePhp({ user: { id: 1, address: { city: "NY" } } });

		expect(output).toContain("class Address");
		expect(output).toContain("class User");
		expect(output).toContain("public Address $address,");
	});

	it("uses PHPDoc to capture array item types that native PHP can't express", () => {
		const output = generatePhp({ tags: ["a", "b"] });

		expect(output).toContain("public array $tags,");
		expect(output).toContain("@param string[] $tags");
	});

	it("marks a field missing from some array elements as nullable with a default", () => {
		const output = generatePhp([{ id: 1, nickname: "a" }, { id: 2 }]);

		expect(output).toContain("public ?string $nickname = null,");
		expect(output).toContain("@param string|null $nickname");
	});

	it("uses a custom root name", () => {
		const output = generatePhp({ id: 1 }, "User");

		expect(output).toContain("class User");
	});
});
