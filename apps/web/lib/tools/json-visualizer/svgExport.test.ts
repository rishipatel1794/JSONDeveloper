import { describe, expect, it } from "vitest";

import { buildJsonTree } from "@/lib/tools/json-validator/json-path";

import { buildGraphSvg } from "./svgExport";
import { buildGraphLayout } from "./treeLayout";

describe("buildGraphSvg", () => {
	it("produces a well-formed svg root element", () => {
		const { root } = buildJsonTree({ a: 1, b: 2 });
		const layout = buildGraphLayout(root, new Set());
		const svg = buildGraphSvg(layout);
		expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
		expect(svg).toContain("</svg>");
	});

	it("renders one rect per node", () => {
		const { root } = buildJsonTree({ a: 1, b: 2, c: 3 });
		const layout = buildGraphLayout(root, new Set());
		const svg = buildGraphSvg(layout);
		const rectCount = (svg.match(/<rect /g) ?? []).length - 1; // minus the background rect
		expect(rectCount).toBe(layout.nodes.length);
	});

	it("renders one path per edge", () => {
		const { root } = buildJsonTree({ a: 1, b: 2 });
		const layout = buildGraphLayout(root, new Set());
		const svg = buildGraphSvg(layout);
		const pathCount = (svg.match(/<path /g) ?? []).length;
		expect(pathCount).toBe(layout.edges.length);
	});

	it("escapes XML-special characters in keys and previews", () => {
		const { root } = buildJsonTree({ "<script>": "a & b" });
		const layout = buildGraphLayout(root, new Set());
		const svg = buildGraphSvg(layout);
		expect(svg).not.toContain("<script>");
		expect(svg).toContain("&lt;script&gt;");
		expect(svg).toContain("a &amp; b");
	});

	it("returns a minimal valid svg for an empty layout", () => {
		const svg = buildGraphSvg({ nodes: [], edges: [], truncated: false });
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});
});
