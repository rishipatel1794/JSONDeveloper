import { formatTreeValueLabel } from "@/lib/tools/json-validator/json-path";
import type { JsonTreeNode } from "@/lib/tools/json-validator/types";

const DEFAULT_MAX_NODES = 300;

function escapeMermaidLabel(text: string): string {
	return text.replace(/"/g, "#quot;").replace(/\n/g, " ");
}

/** Converts a JSON tree into a Mermaid flowchart definition — sequential, Mermaid-safe node IDs, the real key/value as the label. */
export function buildMermaidDiagram(root: JsonTreeNode, maxNodes = DEFAULT_MAX_NODES): { diagram: string; truncated: boolean } {
	const lines: string[] = ["flowchart LR"];
	let idCounter = 0;
	let truncated = false;

	function walk(node: JsonTreeNode, parentId: string | null): void {
		if (idCounter >= maxNodes) {
			truncated = true;
			return;
		}

		const id = `n${idCounter++}`;
		const label = escapeMermaidLabel(`${node.key || "root"}: ${formatTreeValueLabel(node)}`);
		lines.push(`  ${id}["${label}"]`);
		if (parentId) lines.push(`  ${parentId} --> ${id}`);

		for (const child of node.children) {
			if (idCounter >= maxNodes) {
				truncated = true;
				break;
			}
			walk(child, id);
		}
	}

	walk(root, null);

	if (truncated) {
		lines.push("  %% Diagram truncated — too many nodes to export in full");
	}

	return { diagram: lines.join("\n"), truncated };
}
