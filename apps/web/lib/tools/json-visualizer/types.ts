import type { JsonValue } from "@/lib/tools/json-validator/types";
import type { JsonValueType } from "@/lib/tools/json-validator/utils";

export interface GraphNodeData {
	path: string;
	key: string;
	valueType: JsonValueType;
	preview: string;
	childCount: number;
	depth: number;
	collapsed: boolean;
	/** Only present for a primitive leaf, kept small on purpose — full values come from the source tree by path. */
	rawPreview?: string;
}

export interface LayoutNode {
	id: string;
	data: GraphNodeData;
	x: number;
	y: number;
}

export interface LayoutEdge {
	id: string;
	source: string;
	target: string;
}

export interface GraphLayout {
	nodes: LayoutNode[];
	edges: LayoutEdge[];
	truncated: boolean;
}

export type { JsonValue, JsonValueType };
