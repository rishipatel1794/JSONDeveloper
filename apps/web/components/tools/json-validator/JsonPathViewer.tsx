import { Route } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { JsonTreeNode } from "@/lib/tools/json-validator/types";

interface JsonPathViewerProps {
	node: JsonTreeNode | null;
}

function formatValuePreview(node: JsonTreeNode): string {
	if (node.type === "object" || node.type === "array") return JSON.stringify(node.value, null, 2);
	return String(node.value);
}

export function JsonPathViewer({ node }: JsonPathViewerProps) {
	return (
		<ToolPanel title="Selected Property" icon={Route}>
			{!node ? (
				<p className="px-4 py-4 text-sm text-muted-foreground">Click a property in the structure tree to see its path.</p>
			) : (
				<div className="divide-y divide-border-subtle">
					<div className="flex items-center justify-between gap-3 px-4 py-2.5">
						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">Path</p>
							<p className="truncate font-mono text-sm text-foreground">{node.path || "(root)"}</p>
						</div>
						<CopyButton value={node.path} label="Copy Path" ariaLabel="Copy JSON path" />
					</div>

					<div className="px-4 py-2.5">
						<p className="text-xs font-medium text-muted-foreground">Type</p>
						<p className="font-mono text-sm text-foreground">{node.type}</p>
					</div>

					<div className="px-4 py-2.5">
						<p className="text-xs font-medium text-muted-foreground">Value</p>
						<pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-foreground">{formatValuePreview(node)}</pre>
					</div>
				</div>
			)}
		</ToolPanel>
	);
}
