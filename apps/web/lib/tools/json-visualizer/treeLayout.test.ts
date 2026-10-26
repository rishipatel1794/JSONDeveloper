import { describe, expect, it } from "vitest";

import { buildJsonTree } from "@/lib/tools/json-validator/json-path";
import type { JsonValue } from "@/lib/tools/json-validator/types";

import { buildGraphLayout } from "./treeLayout";

function layoutFor(value: JsonValue, collapsed: ReadonlySet<string> = new Set(), maxNodes?: number) {
	const { root } = buildJsonTree(value);
	return buildGraphLayout(root, collapsed, maxNodes);
}

describe("buildGraphLayout", () => {
	it("produces one node per JSON value, including the root", () => {
		const { nodes } = layoutFor({ a: 1, b: { c: 2 } });
		// root + a + b + c = 4
		expect(nodes).toHaveLength(4);
	});

	it("creates an edge for every parent-child relationship", () => {
		const { nodes, edges } = layoutFor({ a: 1, b: 2 });
		expect(edges).toHaveLength(2);
		for (const edge of edges) {
			expect(nodes.some(n => n.id === edge.source)).toBe(true);
			expect(nodes.some(n => n.id === edge.target)).toBe(true);
		}
	});

	it("assigns increasing X by depth", () => {
		const { nodes } = layoutFor({ a: { b: { c: 1 } } });
		const byDepth = new Map(nodes.map(n => [n.data.depth, n.x]));
		expect(byDepth.get(1)!).toBeGreaterThan(byDepth.get(0)!);
		expect(byDepth.get(2)!).toBeGreaterThan(byDepth.get(1)!);
	});

	it("gives sibling leaf nodes distinct Y positions", () => {
		const { nodes } = layoutFor({ a: 1, b: 2, c: 3 });
		const leafYs = nodes.filter(n => n.data.depth === 1).map(n => n.y);
		expect(new Set(leafYs).size).toBe(leafYs.length);
	});

	it("centers a parent over its children", () => {
		const { nodes } = layoutFor({ parent: { x: 1, y: 2, z: 3 } });
		const parent = nodes.find(n => n.data.key === "parent")!;
		const children = nodes.filter(n => n.data.depth === 2);
		const minY = Math.min(...children.map(n => n.y));
		const maxY = Math.max(...children.map(n => n.y));
		expect(parent.y).toBeCloseTo((minY + maxY) / 2);
	});

	it("hides children of a collapsed node", () => {
		const { root } = buildJsonTree({ a: { nested: 1 } });
		const collapsedPath = root.children[0]!.path;
		const { nodes } = buildGraphLayout(root, new Set([collapsedPath]));
		// root + "a" only — "nested" should not appear
		expect(nodes).toHaveLength(2);
		expect(nodes.find(n => n.data.key === "nested")).toBeUndefined();
		expect(nodes.find(n => n.data.key === "a")!.data.collapsed).toBe(true);
	});

	it("marks the layout truncated once the node budget is exceeded", () => {
		const bigArray = Array.from({ length: 50 }, (_, i) => i);
		const { truncated, nodes } = layoutFor(bigArray, new Set(), 10);
		expect(truncated).toBe(true);
		expect(nodes.length).toBeLessThanOrEqual(11); // small slack for the in-progress node when budget hits
	});

	it("does not truncate when everything fits under the budget", () => {
		const { truncated } = layoutFor({ a: 1, b: 2 }, new Set(), 100);
		expect(truncated).toBe(false);
	});

	it("handles a primitive root without throwing", () => {
		expect(() => layoutFor(42)).not.toThrow();
		expect(() => layoutFor(null)).not.toThrow();
		expect(() => layoutFor("just a string")).not.toThrow();
	});

	it("gives the root a stable, non-empty id", () => {
		const { nodes } = layoutFor({ a: 1 });
		const root = nodes.find(n => n.data.depth === 0)!;
		expect(root.id).toBeTruthy();
	});
});
