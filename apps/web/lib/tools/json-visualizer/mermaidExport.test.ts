import { describe, expect, it } from "vitest";

import { buildJsonTree } from "@/lib/tools/json-validator/json-path";

import { buildMermaidDiagram } from "./mermaidExport";

describe("buildMermaidDiagram", () => {
	it("starts with a valid flowchart declaration", () => {
		const { root } = buildJsonTree({ a: 1 });
		const { diagram } = buildMermaidDiagram(root);
		expect(diagram.startsWith("flowchart LR")).toBe(true);
	});

	it("emits one node line and one edge line per parent-child relationship", () => {
		const { root } = buildJsonTree({ a: 1, b: 2 });
		const { diagram } = buildMermaidDiagram(root);
		const nodeLines = diagram.split("\n").filter(line => /^\s*n\d+\[/.test(line));
		const edgeLines = diagram.split("\n").filter(line => line.includes("-->"));
		expect(nodeLines).toHaveLength(3); // root + a + b
		expect(edgeLines).toHaveLength(2);
	});

	it("escapes double quotes in labels", () => {
		const { root } = buildJsonTree({ key: 'has "quotes"' });
		const { diagram } = buildMermaidDiagram(root);
		expect(diagram).toContain("#quot;");
		expect(diagram).not.toMatch(/\["key: "has/);
	});

	it("truncates and marks truncated past the node limit", () => {
		const bigArray = Array.from({ length: 50 }, (_, i) => i);
		const { root } = buildJsonTree(bigArray);
		const { diagram, truncated } = buildMermaidDiagram(root, 10);
		expect(truncated).toBe(true);
		expect(diagram).toContain("truncated");
	});

	it("does not mark truncated when everything fits", () => {
		const { root } = buildJsonTree({ a: 1 });
		const { truncated } = buildMermaidDiagram(root, 100);
		expect(truncated).toBe(false);
	});

	it("produces valid output for a primitive root", () => {
		const { root } = buildJsonTree(42);
		const { diagram } = buildMermaidDiagram(root);
		expect(diagram).toContain("n0[");
	});
});
