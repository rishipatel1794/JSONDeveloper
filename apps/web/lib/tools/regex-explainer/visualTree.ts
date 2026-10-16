import type { TokenRow } from "./tokenize";

export interface VisualNode {
	raw: string;
	label: string;
	children: VisualNode[];
}

/**
 * Reuses the same flat, depth-tagged rows the token table renders, so the tree view and the table
 * never describe a token differently — just arranges them hierarchically via a parent stack keyed by
 * depth, since the rows are already in source (pre-order) sequence.
 */
export function buildVisualTree(rows: TokenRow[]): VisualNode[] {
	const root: VisualNode[] = [];
	const stack: VisualNode[] = [];

	for (const row of rows) {
		const node: VisualNode = { raw: row.raw, label: row.meaning, children: [] };

		stack.length = Math.min(stack.length, row.depth);

		const parent = stack[stack.length - 1];
		if (parent) {
			parent.children.push(node);
		} else {
			root.push(node);
		}

		stack.push(node);
	}

	return root;
}
