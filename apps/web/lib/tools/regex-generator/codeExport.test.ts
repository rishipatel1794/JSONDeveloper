import { describe, expect, it } from "vitest";

import { buildCodeSnippets } from "./codeExport";

function extractJsStringLiteral(code: string): string {
	const match = /"((?:[^"\\]|\\.)*)"/.exec(code);
	if (!match) throw new Error(`No string literal found in: ${code}`);
	return new Function(`return "${match[1]}"`)();
}

describe("buildCodeSnippets", () => {
	it("produces one snippet per supported language", () => {
		const snippets = buildCodeSnippets("\\d+", "g");
		expect(snippets.map(s => s.language)).toEqual(["javascript", "python", "php", "java"]);
	});

	it.each([
		["\\d{3}-\\d{4}", ""],
		['has "quotes" inside', ""],
		["has\\backslash", ""],
		["^[A-Z]+$", "i"],
	])("JavaScript snippet round-trips the exact pattern source: %s", pattern => {
		const [js] = buildCodeSnippets(pattern, "");
		expect(extractJsStringLiteral(js!.code)).toBe(pattern);
	});

	it.each([
		["\\d{3}-\\d{4}", ""],
		['has "quotes" inside', ""],
		["has\\backslash", ""],
	])("Java snippet round-trips the exact pattern source: %s", pattern => {
		const [, , , java] = buildCodeSnippets(pattern, "");
		expect(extractJsStringLiteral(java!.code)).toBe(pattern);
	});

	it("maps JS flags to the correct Python flags", () => {
		const [, python] = buildCodeSnippets("abc", "im");
		expect(python!.code).toContain("re.IGNORECASE");
		expect(python!.code).toContain("re.MULTILINE");
	});

	it("warns that Python has no global compile flag", () => {
		const [, python] = buildCodeSnippets("abc", "g");
		expect(python!.warnings.some(w => w.includes("findall"))).toBe(true);
	});

	it("warns that PHP has no global modifier", () => {
		const [, , php] = buildCodeSnippets("abc", "g");
		expect(php!.warnings.some(w => w.includes("preg_match_all"))).toBe(true);
	});

	it("switches PHP delimiter to # when the pattern contains a literal slash", () => {
		const [, , php] = buildCodeSnippets("https?://example", "");
		expect(php!.code).toContain("#https?://example#");
	});

	it("maps JS flags to the correct Java Pattern constants", () => {
		const [, , , java] = buildCodeSnippets("abc", "is");
		expect(java!.code).toContain("Pattern.CASE_INSENSITIVE");
		expect(java!.code).toContain("Pattern.DOTALL");
	});

	it("warns about the sticky flag having no equivalent in Python, PHP, or Java", () => {
		const [, python, php, java] = buildCodeSnippets("abc", "y");
		expect(python!.warnings.length).toBeGreaterThan(0);
		expect(php!.warnings.length).toBeGreaterThan(0);
		expect(java!.warnings.length).toBeGreaterThan(0);
	});

	it("never throws for patterns containing every kind of special character", () => {
		expect(() => buildCodeSnippets("a\"b'c\\d/e#f", "gimsuy")).not.toThrow();
	});
});
