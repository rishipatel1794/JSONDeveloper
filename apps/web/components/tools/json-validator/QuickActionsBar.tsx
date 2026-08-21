import { Copy, Download, FileCode2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolToolbar } from "@/components/tools/shared/ToolToolbar";
import type { GeneratedOutputTab } from "./GeneratedOutput";

interface QuickActionsBarProps {
	disabled: boolean;
	onGenerate: (tab: GeneratedOutputTab) => void;
	onCopy: () => void;
	onDownload: () => void;
}

/** Generation + output actions — Format/Minify/Clear live on the editor panel itself (they act in-place on the input). */
export function QuickActionsBar({ disabled, onGenerate, onCopy, onDownload }: QuickActionsBarProps) {
	return (
		<div>
			<h2 className="mb-2 text-sm font-semibold text-foreground">Quick Actions</h2>
			<ToolToolbar>
				<Button onClick={() => onGenerate("typescript")} variant="outline" size="sm" disabled={disabled}>
					<FileCode2 className="size-3.5" />
					TypeScript
				</Button>
				<Button onClick={() => onGenerate("zod")} variant="outline" size="sm" disabled={disabled}>
					<FileCode2 className="size-3.5" />
					Zod
				</Button>
				<Button onClick={() => onGenerate("jsonschema")} variant="outline" size="sm" disabled={disabled}>
					<ShieldCheck className="size-3.5" />
					JSON Schema
				</Button>

				<div className="mx-1 hidden h-6 w-px bg-border sm:block" />

				<Button onClick={onCopy} variant="ghost" size="sm" disabled={disabled}>
					<Copy className="size-3.5" />
					Copy
				</Button>
				<Button onClick={onDownload} variant="ghost" size="sm" disabled={disabled}>
					<Download className="size-3.5" />
					Download
				</Button>
			</ToolToolbar>
		</div>
	);
}
