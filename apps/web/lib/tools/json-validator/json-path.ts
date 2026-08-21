import type { JsonTreeNode, JsonValue } from "./types";
import { getValueType, isPlainObject } from "./utils";

const MAX_TREE_NODES = 20_000;

export interface BuildTreeOutcome {
	root: JsonTreeNode;
	truncated: boolean;
}

/** Builds a full tree structure once — collapsed branches simply aren't rendered, so this stays cheap in practice. */
export function buildJsonTree(value: JsonValue, rootLabel = "root"): BuildTreeOutcome {
	let nodeCount = 0;
	let truncated = false;

	function build(key: string, path: string, node: JsonValue, depth: number): JsonTreeNode {
		nodeCount++;
		if (nodeCount > MAX_TREE_NODES) truncated = true;

		const type = getValueType(node);

		if (truncated || type === "string" || type === "number" || type === "boolean" || type === "null") {
			return { key, path, type, value: node, children: [], depth };
		}

		if (type === "array") {
			const array = node as JsonValue[];
			const children = truncated ? [] : array.map((item, index) => build(String(index), `${path}[${index}]`, item, depth + 1));
			return { key, path, type, value: node, children, depth };
		}

		const entries = Object.entries(node as Record<string, JsonValue>);
		const children = truncated ? [] : entries.map(([childKey, childValue]) => build(childKey, path ? `${path}.${childKey}` : childKey, childValue, depth + 1));
		return { key, path, type, value: node, children, depth };
	}

	const root = build(rootLabel, "", value, 0);
	return { root, truncated };
}

export function getValueAtPath(root: JsonValue, path: string): JsonValue | undefined {
	if (!path) return root;

	const segments = path.match(/[^.[\]]+/g) ?? [];
	let current: JsonValue | undefined = root;

	for (const segment of segments) {
		if (current === undefined || current === null) return undefined;

		if (/^\d+$/.test(segment) && Array.isArray(current)) {
			current = current[Number(segment)];
		} else if (isPlainObject(current)) {
			current = current[segment];
		} else {
			return undefined;
		}
	}

	return current;
}

/** Formats a type-annotated one-line label for a tree row, e.g. `city: string` or `roles: string[3]`. */
export function formatTreeValueLabel(node: JsonTreeNode): string {
	switch (node.type) {
		case "object":
			return `{${node.children.length}}`;
		case "array":
			return `[${node.children.length}]`;
		case "string":
			return `"${truncateForDisplay(node.value as string)}"`;
		case "number":
		case "boolean":
			return String(node.value);
		case "null":
			return "null";
	}
}

function truncateForDisplay(value: string, max = 60): string {
	return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Paths of every node whose key or primitive value contains `query` (case-insensitive). */
export function searchJsonTree(root: JsonTreeNode, query: string): Set<string> {
	const matches = new Set<string>();
	const needle = query.trim().toLowerCase();
	if (!needle) return matches;

	function visit(node: JsonTreeNode): void {
		const keyMatches = node.key.toLowerCase().includes(needle);
		const valueMatches =
			(node.type === "string" && (node.value as string).toLowerCase().includes(needle)) ||
			((node.type === "number" || node.type === "boolean") && String(node.value).toLowerCase().includes(needle));

		if (keyMatches || valueMatches) matches.add(node.path);
		for (const child of node.children) visit(child);
	}

	visit(root);
	return matches;
}

/** Every ancestor path of a matched node — used to auto-expand the tree down to a search match. */
export function expandedAncestorPaths(matchPaths: Set<string>): Set<string> {
	const expanded = new Set<string>();

	for (const path of matchPaths) {
		const segments = path.match(/[^.[\]]+/g) ?? [];
		let current = "";
		for (let i = 0; i < segments.length - 1; i++) {
			const segment = segments[i]!;
			const isIndex = /^\d+$/.test(segment);
			current = isIndex ? `${current}[${segment}]` : current ? `${current}.${segment}` : segment;
			expanded.add(current);
		}
	}

	return expanded;
}
