import { GitBranch } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { VisualNode } from "@/lib/tools/regex-explainer/visualTree";

function TreeNode({ node }: { node: VisualNode }) {
	return (
		<li>
			<div className="flex items-center gap-2 py-0.5">
				<code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">{node.raw}</code>
				<span className="text-sm text-muted-foreground">{node.label}</span>
			</div>
			{node.children.length > 0 && (
				<ul role="group" className="ml-4 space-y-0.5 border-l border-border-subtle pl-3">
					{node.children.map((child, index) => (
						<TreeNode key={index} node={child} />
					))}
				</ul>
			)}
		</li>
	);
}

export function VisualStructureTree({ nodes }: { nodes: VisualNode[] }) {
	return (
		<ToolPanel title="Visual structure" icon={GitBranch}>
			<ul role="tree" className="space-y-0.5 p-4">
				{nodes.map((node, index) => (
					<TreeNode key={index} node={node} />
				))}
			</ul>
		</ToolPanel>
	);
}
