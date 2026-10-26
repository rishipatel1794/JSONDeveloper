import { formatTreeValueLabel } from "@/lib/tools/json-validator/json-path";
import type { JsonTreeNode } from "@/lib/tools/json-validator/types";

import type { GraphLayout, GraphNodeData, LayoutEdge, LayoutNode } from "./types";

export const DEFAULT_MAX_GRAPH_NODES = 1500;

const X_SPACING = 260;
const Y_SPACING = 70;

function rootId(path: string): string {
	return path === "" ? "$root" : path;
}

function toNodeData(node: JsonTreeNode, depth: number, collapsed: boolean): GraphNodeData {
	return {
		path: node.path,
		key: node.key,
		valueType: node.type,
		preview: formatTreeValueLabel(node),
		childCount: node.children.length,
		depth,
		collapsed,
	};
}

/**
 * A simplified Reingold–Tilford-style tree layout, computed in a single top-down pass: each node is
 * placed after its children (so its own Y is the midpoint of theirs), with depth mapped to X and
 * sibling order mapped to Y — left-to-right reads naturally for JSON's usual depth-heavy nesting.
 * No external layout library (e.g. dagre) is needed since JSON is strictly a tree, never a general DAG.
 */
export function buildGraphLayout(root: JsonTreeNode, collapsedPaths: ReadonlySet<string>, maxNodes = DEFAULT_MAX_GRAPH_NODES): GraphLayout {
	const nodes: LayoutNode[] = [];
	const edges: LayoutEdge[] = [];
	let truncated = false;
	let budgetUsed = 0;

	function isCollapsed(node: JsonTreeNode): boolean {
		return node.children.length > 0 && collapsedPaths.has(node.path);
	}

	/** Places `node` and its visible descendants, returning how many Y-units of vertical space it used. */
	function place(node: JsonTreeNode, depth: number, yStart: number): number {
		budgetUsed++;
		const id = rootId(node.path);
		const collapsed = isCollapsed(node);

		if (node.children.length === 0 || collapsed) {
			nodes.push({ id, data: toNodeData(node, depth, collapsed), x: depth * X_SPACING, y: yStart * Y_SPACING });
			return 1;
		}

		let cursor = yStart;
		const childCenters: number[] = [];

		for (const child of node.children) {
			if (budgetUsed >= maxNodes) {
				truncated = true;
				break;
			}
			const height = place(child, depth + 1, cursor);
			childCenters.push(cursor + (height - 1) / 2);
			cursor += height;
			edges.push({ id: `${id}->${rootId(child.path)}`, source: id, target: rootId(child.path) });
		}

		const totalHeight = Math.max(cursor - yStart, 1);
		const selfY = childCenters.length > 0 ? (childCenters[0]! + childCenters[childCenters.length - 1]!) / 2 : yStart;
		nodes.push({ id, data: toNodeData(node, depth, collapsed), x: depth * X_SPACING, y: selfY * Y_SPACING });

		return totalHeight;
	}

	place(root, 0, 0);

	return { nodes, edges, truncated };
}
