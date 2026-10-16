import { describe, expect, it } from "vitest";

import { buildFromRequirements } from "./requirementsBuilder";

describe("buildFromRequirements", () => {
	it("builds a working min/max length check", () => {
		const { pattern, warnings } = buildFromRequirements({ minLength: 3, maxLength: 5 });
		const regex = new RegExp(pattern);
		expect(warnings).toEqual([]);
		expect(regex.test("abc")).toBe(true);
		expect(regex.test("abcde")).toBe(true);
		expect(regex.test("ab")).toBe(false);
		expect(regex.test("abcdef")).toBe(false);
	});

	it("warns when minLength exceeds maxLength but still generates a pattern", () => {
		const { pattern, warnings } = buildFromRequirements({ minLength: 10, maxLength: 5 });
		expect(warnings[0]).toMatch(/greater than maximum/);
		expect(new RegExp(pattern).test("anything")).toBe(false);
	});

	it("requires uppercase, lowercase, number, and special character together", () => {
		const { pattern } = buildFromRequirements({
			requireUppercase: true,
			requireLowercase: true,
			requireNumber: true,
			requireSpecial: true,
			minLength: 8,
		});
		const regex = new RegExp(pattern);
		expect(regex.test("Abcdef1!")).toBe(true);
		expect(regex.test("abcdef1!")).toBe(false); // no uppercase
		expect(regex.test("ABCDEF1!")).toBe(false); // no lowercase
		expect(regex.test("Abcdefg!")).toBe(false); // no number
		expect(regex.test("Abcdefg1")).toBe(false); // no special char
	});

	it("enforces a literal prefix and suffix", () => {
		const { pattern } = buildFromRequirements({ startsWith: "ID-", endsWith: "-X" });
		const regex = new RegExp(pattern);
		expect(regex.test("ID-12345-X")).toBe(true);
		expect(regex.test("12345-X")).toBe(false);
		expect(regex.test("ID-12345")).toBe(false);
	});

	it("escapes regex-special characters in startsWith/endsWith", () => {
		const { pattern } = buildFromRequirements({ startsWith: "a.b", endsWith: "c+d" });
		const regex = new RegExp(pattern);
		expect(regex.test("a.bXXXc+d")).toBe(true);
		expect(regex.test("aXbXXXcZd")).toBe(false);
	});

	it("restricts to an allowed character set", () => {
		const { pattern } = buildFromRequirements({ allowedChars: "abc123" });
		const regex = new RegExp(pattern);
		expect(regex.test("a1b2c3")).toBe(true);
		expect(regex.test("abcxyz")).toBe(false);
	});

	it("excludes a forbidden character set when no allowed set is given", () => {
		const { pattern } = buildFromRequirements({ forbiddenChars: "<>&" });
		const regex = new RegExp(pattern);
		expect(regex.test("hello world")).toBe(true);
		expect(regex.test("<script>")).toBe(false);
	});

	it("warns and ignores forbiddenChars when allowedChars is also given", () => {
		const { warnings } = buildFromRequirements({ allowedChars: "abc", forbiddenChars: "xyz" });
		expect(warnings.some(w => w.includes("ignored"))).toBe(true);
	});

	it("warns when a required character class has no representative in the allowed set", () => {
		const { warnings } = buildFromRequirements({ allowedChars: "abcdef", requireUppercase: true });
		expect(warnings.some(w => w.includes("uppercase"))).toBe(true);
	});

	it("escapes special characters in a character-class range safely", () => {
		const { pattern } = buildFromRequirements({ allowedChars: "a-z]\\^" });
		expect(() => new RegExp(pattern)).not.toThrow();
	});

	it("produces a pattern with no constraints that matches anything, including empty string", () => {
		const { pattern } = buildFromRequirements({});
		const regex = new RegExp(pattern);
		expect(regex.test("")).toBe(true);
		expect(regex.test("anything")).toBe(true);
	});
});
