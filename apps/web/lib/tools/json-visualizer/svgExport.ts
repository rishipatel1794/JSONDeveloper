import type { GraphLayout } from "./types";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 56;
const PADDING = 40;

const TYPE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
	object: { fill: "#1e293b", stroke: "#64748b", text: "#e2e8f0" },
	array: { fill: "#1e3a5f", stroke: "#3b82f6", text: "#dbeafe" },
	string: { fill: "#14532d", stroke: "#22c55e", text: "#dcfce7" },
	number: { fill: "#3730a3", stroke: "#818cf8", text: "#e0e7ff" },
	boolean: { fill: "#78350f", stroke: "#f59e0b", text: "#fef3c7" },
	null: { fill: "#374151", stroke: "#9ca3af", text: "#f3f4f6" },
};

function escapeXml(value: string): string {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Renders a layout (already positioned by treeLayout) as a standalone, self-contained SVG document. */
export function buildGraphSvg(layout: GraphLayout): string {
	const { nodes, edges } = layout;

	if (nodes.length === 0) {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="#0f172a" /></svg>`;
	}

	const minX = Math.min(...nodes.map(n => n.x)) - NODE_WIDTH / 2;
	const maxX = Math.max(...nodes.map(n => n.x)) + NODE_WIDTH / 2;
	const minY = Math.min(...nodes.map(n => n.y)) - NODE_HEIGHT / 2;
	const maxY = Math.max(...nodes.map(n => n.y)) + NODE_HEIGHT / 2;

	const width = Math.round(maxX - minX + PADDING * 2);
	const height = Math.round(maxY - minY + PADDING * 2);
	const offsetX = -minX + PADDING;
	const offsetY = -minY + PADDING;

	const byId = new Map(nodes.map(n => [n.id, n]));

	const edgeMarkup = edges
		.map(edge => {
			const source = byId.get(edge.source);
			const target = byId.get(edge.target);
			if (!source || !target) return "";

			const x1 = source.x + offsetX + NODE_WIDTH / 2;
			const y1 = source.y + offsetY;
			const x2 = target.x + offsetX - NODE_WIDTH / 2;
			const y2 = target.y + offsetY;
			const midX = (x1 + x2) / 2;

			return `<path d="M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="1.5" />`;
		})
		.join("\n");

	const nodeMarkup = nodes
		.map(node => {
			const colors = TYPE_COLORS[node.data.valueType] ?? TYPE_COLORS.null!;
			const x = node.x + offsetX - NODE_WIDTH / 2;
			const y = node.y + offsetY - NODE_HEIGHT / 2;
			const label = escapeXml(node.data.key || "root");
			const preview = escapeXml(node.data.preview);

			return [
				`<rect x="${x}" y="${y}" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="8" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1.5" />`,
				`<text x="${x + 12}" y="${y + 22}" font-family="monospace" font-size="13" fill="${colors.text}" font-weight="600">${label}</text>`,
				`<text x="${x + 12}" y="${y + 40}" font-family="monospace" font-size="11" fill="${colors.text}" opacity="0.8">${preview}</text>`,
			].join("\n");
		})
		.join("\n");

	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
		`<rect width="${width}" height="${height}" fill="#0f172a" />`,
		edgeMarkup,
		nodeMarkup,
		`</svg>`,
	].join("\n");
}
