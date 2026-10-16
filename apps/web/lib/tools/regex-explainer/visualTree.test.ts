import { describe, expect, it } from "vitest";

import { parseRegexPattern } from "./parser";
import { tokenizePattern } from "./tokenize";
import { buildVisualTree } from "./visualTree";

function treeFor(pattern: string) {
	const result = parseRegexPattern(pattern, "");
	if (!result.success) throw new Error(result.error);
	return buildVisualTree(tokenizePattern(result.pattern));
}

describe("buildVisualTree", () => {
	it("produces a flat list for a pattern with no groups", () => {
		const tree = treeFor("^[A-Z]{2}\\d{4}$");
		expect(tree).toHaveLength(4);
		expect(tree.every(node => node.children.length === 0)).toBe(true);
	});

	it("nests a capturing group's contents under the group node", () => {
		const tree = treeFor("a(bc)d");
		expect(tree.map(n => n.raw)).toEqual(["a", "(", "d"]);
		const groupNode = tree[1]!;
		expect(groupNode.children.map(n => n.raw)).toEqual(["b", "c"]);
	});

	it("handles two levels of nesting", () => {
		const tree = treeFor("(a(b)c)");
		const outer = tree[0]!;
		expect(outer.children.map(n => n.raw)).toEqual(["a", "(", "c"]);
		const inner = outer.children[1]!;
		expect(inner.children.map(n => n.raw)).toEqual(["b"]);
	});

	it("keeps alternation branches at the same level as a sibling node", () => {
		const tree = treeFor("cat|dog");
		expect(tree.some(node => node.label.includes("OR"))).toBe(true);
	});

	it("never throws building a tree for a deeply nested pattern", () => {
		expect(() => treeFor("(((((a)))))")).not.toThrow();
	});
});
