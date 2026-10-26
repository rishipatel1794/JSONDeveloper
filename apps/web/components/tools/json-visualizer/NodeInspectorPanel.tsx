import { Crosshair } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { JsonValue } from "@/lib/tools/json-validator/types";

interface NodeInspectorPanelProps {
	path: string;
	value: JsonValue | undefined;
}

export function NodeInspectorPanel({ path, value }: NodeInspectorPanelProps) {
	const serialized = value === undefined ? "" : JSON.stringify(value, null, 2);
	const displayPath = path === "" || path === "$root" ? "$ (root)" : `$.${path}`;

	return (
		<ToolPanel title="Selected node" icon={Crosshair}>
			<div className="space-y-3 p-3">
				<div className="flex items-center justify-between gap-2">
					<code className="truncate font-mono text-xs text-muted-foreground">{displayPath}</code>
					<CopyButton value={displayPath} label="Copy path" />
				</div>

				<div className="flex items-start justify-between gap-2">
					<pre className="max-h-64 flex-1 overflow-auto rounded-md bg-secondary p-2.5 font-mono text-xs text-foreground">{serialized || "undefined"}</pre>
					<CopyButton value={serialized} label="Copy value" />
				</div>
			</div>
		</ToolPanel>
	);
}
