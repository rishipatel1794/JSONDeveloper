import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { GraphNodeData } from "@/lib/tools/json-visualizer/types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
	object: "border-border-subtle bg-secondary text-foreground",
	array: "border-info/40 bg-info/10 text-foreground",
	string: "border-success-border bg-success-muted text-foreground",
	number: "border-primary/40 bg-primary/10 text-foreground",
	boolean: "border-warning/40 bg-warning/10 text-foreground",
	null: "border-border bg-card text-muted-foreground",
};

export interface GraphNodeFlowData extends Record<string, unknown> {
	node: GraphNodeData;
	selected: boolean;
	highlighted: boolean;
	onToggleCollapse: (path: string) => void;
	onSelect: (path: string) => void;
}

function GraphNodeCardImpl({ data }: NodeProps & { data: GraphNodeFlowData }) {
	const { node, selected, highlighted, onToggleCollapse, onSelect } = data;
	const hasChildren = node.childCount > 0;

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onSelect(node.path)}
			onKeyDown={event => {
				if (event.key === "Enter" || event.key === " ") onSelect(node.path);
			}}
			className={cn(
				"flex w-50 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs shadow-sm transition-colors",
				TYPE_STYLES[node.valueType] ?? TYPE_STYLES.null,
				selected && "ring-2 ring-primary",
				highlighted && "ring-2 ring-warning",
			)}
		>
			<Handle type="target" position={Position.Left} className="size-1.5! border-0! bg-border-subtle!" />

			{hasChildren && (
				<button
					type="button"
					onClick={event => {
						event.stopPropagation();
						onToggleCollapse(node.path);
					}}
					aria-label={node.collapsed ? `Expand ${node.key}` : `Collapse ${node.key}`}
					className="shrink-0 text-muted-foreground hover:text-foreground"
				>
					{node.collapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
				</button>
			)}

			<div className="min-w-0 flex-1">
				<p className="truncate font-mono font-semibold">{node.key || "root"}</p>
				<p className="truncate font-mono text-[11px] opacity-80">{node.preview}</p>
			</div>

			{hasChildren && (
				<span className="shrink-0 rounded-full bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">{node.childCount}</span>
			)}

			<Handle type="source" position={Position.Right} className="size-1.5! border-0! bg-border-subtle!" />
		</div>
	);
}

export const GraphNodeCard = memo(GraphNodeCardImpl);
