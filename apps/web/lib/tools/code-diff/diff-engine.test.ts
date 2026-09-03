import { describe, expect, it } from "vitest";

import { computeDiff, generateUnifiedDiffText } from "./diff-engine";

describe("computeDiff", () => {
	it("detects identical code as no changes", () => {
		const result = computeDiff("const a = 1;\nconst b = 2;", "const a = 1;\nconst b = 2;");

		expect(result.identical).toBe(true);
		expect(result.stats).toEqual({ added: 0, removed: 0, changes: 0 });
		expect(result.lines.every(line => line.type === "unchanged")).toBe(true);
	});

	it("detects a single added line", () => {
		const result = computeDiff("line1\nline2", "line1\nline2\nline3");

		expect(result.identical).toBe(false);
		expect(result.stats).toEqual({ added: 1, removed: 0, changes: 1 });
		const added = result.lines.filter(line => line.type === "added");
		expect(added).toHaveLength(1);
		expect(added[0]).toMatchObject({ newContent: "line3", oldLineNumber: null, newLineNumber: 3 });
	});

	it("detects a single removed line", () => {
		const result = computeDiff("line1\nline2\nline3", "line1\nline3");

		expect(result.stats).toEqual({ added: 0, removed: 1, changes: 1 });
		const removed = result.lines.filter(line => line.type === "removed");
		expect(removed).toHaveLength(1);
		expect(removed[0]).toMatchObject({ oldContent: "line2", oldLineNumber: 2, newLineNumber: null });
	});

	it("detects a modified line as a removed+added pair", () => {
		const result = computeDiff("const user = getUserData();\nreturn user;", "const user = getUser();\nreturn user;");

		expect(result.stats).toEqual({ added: 1, removed: 1, changes: 2 });
		expect(result.lines[0]).toMatchObject({ type: "removed", oldContent: "const user = getUserData();" });
		expect(result.lines[1]).toMatchObject({ type: "added", newContent: "const user = getUser();" });
		expect(result.lines[2]).toMatchObject({ type: "unchanged", oldContent: "return user;", newContent: "return user;" });
	});

	it("detects multiple separate changes and groups them into distinct hunks", () => {
		const original = "a\nb\nc\nd\ne";
		const modified = "a\nX\nc\nd\nY";

		const result = computeDiff(original, modified);

		expect(result.stats).toEqual({ added: 2, removed: 2, changes: 4 });
		expect(result.hunks).toHaveLength(2);
	});

	it("treats an empty original as every modified line being added", () => {
		const result = computeDiff("", "line1\nline2");

		expect(result.stats).toEqual({ added: 2, removed: 0, changes: 2 });
		expect(result.lines.every(line => line.type === "added")).toBe(true);
	});

	it("treats an empty modified as every original line being removed", () => {
		const result = computeDiff("line1\nline2", "");

		expect(result.stats).toEqual({ added: 0, removed: 2, changes: 2 });
		expect(result.lines.every(line => line.type === "removed")).toBe(true);
	});

	it("handles multiline changes spanning several consecutive lines", () => {
		const original = "function greet() {\n  console.log('hi');\n}";
		const modified = "function greet(name) {\n  console.log('hello ' + name);\n}";

		const result = computeDiff(original, modified);

		expect(result.stats.removed).toBe(2);
		expect(result.stats.added).toBe(2);
		expect(result.hunks).toHaveLength(1);
		expect(result.hunks[0]).toEqual({ startIndex: 0, endIndex: 3 });
	});

	it("ignores whitespace-only differences when ignoreWhitespace is set", () => {
		const original = "const a = 1;\nconst b = 2;";
		const modified = "const a = 1;   \nconst b = 2;";

		const withoutOption = computeDiff(original, modified);
		expect(withoutOption.identical).toBe(false);

		const withOption = computeDiff(original, modified, { ignoreWhitespace: true });
		expect(withOption.identical).toBe(true);
	});

	it("ignores blank-line-only differences when ignoreEmptyLines is set, while preserving real line numbers", () => {
		const original = "const a = 1;\n\nconst b = 2;";
		const modified = "const a = 1;\nconst b = 2;";

		const withoutOption = computeDiff(original, modified);
		expect(withoutOption.identical).toBe(false);

		const withOption = computeDiff(original, modified, { ignoreEmptyLines: true });
		expect(withOption.identical).toBe(true);
		expect(withOption.lines.map(line => line.oldLineNumber)).toEqual([1, 3]);
	});
});

describe("generateUnifiedDiffText", () => {
	it("produces a unified diff with the standard --- / +++ / @@ markers", () => {
		const text = generateUnifiedDiffText("a\nb", "a\nc", { originalLabel: "old.js", modifiedLabel: "new.js" });

		expect(text).toContain("--- old.js");
		expect(text).toContain("+++ new.js");
		expect(text).toContain("@@");
		expect(text).toContain("-b");
		expect(text).toContain("+c");
	});
});
