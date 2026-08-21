import type { JsonStatistics, JsonValue } from "./types";
import { computeUtf8ByteLength, isPlainObject } from "./utils";

/**
 * Depth of a value's container nesting. An empty or primitive-only object/array counts as depth 1;
 * a bare primitive (non-container) root counts as depth 0. Validated against the spec's own examples:
 * a flat 3-key object -> depth 1; a 4-level nested object (user.profile.address.city) -> depth 4.
 */
export function computeMaxDepth(value: JsonValue): number {
	if (Array.isArray(value)) {
		if (value.length === 0) return 1;
		return 1 + Math.max(...value.map(computeMaxDepth));
	}
	if (isPlainObject(value)) {
		const children = Object.values(value);
		if (children.length === 0) return 1;
		return 1 + Math.max(...children.map(computeMaxDepth));
	}
	return 0;
}

const MAX_NODES_FOR_ANALYSIS = 500_000;

export interface StatisticsOutcome {
	statistics: JsonStatistics;
	/** True when the walk was stopped early because the document has an unreasonable number of nodes. */
	truncated: boolean;
}

/** Walks a parsed JSON value once, counting every node kind. Object keys are counted separately — never as string values. */
export function computeStatistics(value: JsonValue, rawInput: string): StatisticsOutcome {
	const statistics: JsonStatistics = {
		objects: 0,
		arrays: 0,
		keys: 0,
		strings: 0,
		numbers: 0,
		booleans: 0,
		nulls: 0,
		totalNodes: 0,
		maxDepth: 0,
		sizeBytes: computeUtf8ByteLength(rawInput),
	};

	let truncated = false;

	function walk(node: JsonValue): void {
		if (truncated) return;
		if (statistics.totalNodes >= MAX_NODES_FOR_ANALYSIS) {
			truncated = true;
			return;
		}

		if (node === null) {
			statistics.nulls++;
			statistics.totalNodes++;
			return;
		}

		if (Array.isArray(node)) {
			statistics.arrays++;
			statistics.totalNodes++;
			for (const item of node) walk(item);
			return;
		}

		if (isPlainObject(node)) {
			statistics.objects++;
			statistics.totalNodes++;
			const keys = Object.keys(node);
			statistics.keys += keys.length;
			for (const key of keys) walk(node[key]!);
			return;
		}

		if (typeof node === "string") {
			statistics.strings++;
			statistics.totalNodes++;
			return;
		}

		if (typeof node === "number") {
			statistics.numbers++;
			statistics.totalNodes++;
			return;
		}

		if (typeof node === "boolean") {
			statistics.booleans++;
			statistics.totalNodes++;
			return;
		}
	}

	walk(value);
	statistics.maxDepth = computeMaxDepth(value);

	return { statistics, truncated };
}
