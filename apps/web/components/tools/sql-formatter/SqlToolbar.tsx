import { ToolToolbar } from "@/components/tools/shared/ToolToolbar";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

import { SqlExamples } from "./SqlExamples";

interface SqlToolbarProps {
	hasInput: boolean;
	output: string;
	onFormat: () => void;
	onMinify: () => void;
	onDownload: () => void;
	onClear: () => void;
	onLoadExample: (index: number) => void;
}

export function SqlToolbar({ hasInput, output, onFormat, onMinify, onDownload, onClear, onLoadExample }: SqlToolbarProps) {
	return (
		<ToolToolbar>
			<Button onClick={onFormat} disabled={!hasInput}>
				Format
			</Button>
			<Button onClick={onMinify} variant="secondary" disabled={!hasInput}>
				Minify
			</Button>

			<SqlExamples onSelect={onLoadExample} />

			<CopyButton value={output} label="Copy" disabled={!output} />
			<Button onClick={onDownload} variant="outline" disabled={!output}>
				Download
			</Button>

			<Button onClick={onClear} variant="ghost" className="ml-auto text-destructive hover:bg-destructive-muted">
				Clear
			</Button>
		</ToolToolbar>
	);
}
