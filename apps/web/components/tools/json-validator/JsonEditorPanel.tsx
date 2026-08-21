import { Braces, Check, FileJson2, Minimize2, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CodeEditor, type EditorMarker } from "@/components/tools/shared/CodeEditor";
import { formatBytes } from "@/lib/tools/json-validator/utils";

interface JsonEditorPanelProps {
	value: string;
	onChange: (value: string) => void;
	onValidateNow: () => void;
	onFormat: () => void;
	onMinify: () => void;
	onClear: () => void;
	onSendToApiClient?: () => void;
	markers: EditorMarker[];
	revealLine?: number;
	sizeBytes: number;
}

export function JsonEditorPanel({
	value,
	onChange,
	onValidateNow,
	onFormat,
	onMinify,
	onClear,
	onSendToApiClient,
	markers,
	revealLine,
	sizeBytes,
}: JsonEditorPanelProps) {
	const disabled = !value.trim();

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
			<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
				<div className="flex items-center gap-2 text-sm font-medium">
					<FileJson2 className="size-4 text-muted-foreground" />
					JSON Input
				</div>
				<span className="text-xs text-muted-foreground">{value ? formatBytes(sizeBytes) : "Empty"}</span>
			</div>

			<CodeEditor value={value} onChange={onChange} markers={markers} revealLine={revealLine} height="420px" placeholder="Paste or type JSON here…" />

			<div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
				<Button onClick={onValidateNow} variant="primary" size="sm" disabled={disabled}>
					<Check className="size-3.5" />
					Validate JSON
				</Button>
				<Button onClick={onFormat} variant="outline" size="sm" disabled={disabled}>
					<Braces className="size-3.5" />
					Format
				</Button>
				<Button onClick={onMinify} variant="outline" size="sm" disabled={disabled}>
					<Minimize2 className="size-3.5" />
					Minify
				</Button>

				{onSendToApiClient && (
					<Button onClick={onSendToApiClient} variant="outline" size="sm">
						<Send className="size-3.5" />
						Send to API Client
					</Button>
				)}

				<div className="ml-auto">
					<Button onClick={onClear} variant="ghost" size="sm" disabled={disabled} className="text-destructive hover:bg-destructive-muted">
						<Trash2 className="size-3.5" />
						Clear
					</Button>
				</div>
			</div>
		</div>
	);
}
