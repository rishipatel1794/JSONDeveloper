import { Plus, Trash2 } from "lucide-react";

import type { KeyValuePair } from "@/lib/tools/shared/http";
import { createKeyValuePair } from "@/lib/tools/shared/http";
import { cn } from "@/lib/utils";

interface KeyValueEditorProps {
	items: KeyValuePair[];
	onChange: (items: KeyValuePair[]) => void;
	keyPlaceholder?: string;
	valuePlaceholder?: string;
	addLabel?: string;
	/** Shows a Text/File toggle per row and swaps the value input's placeholder — used for multipart fields. */
	showFileToggle?: boolean;
	"aria-label"?: string;
}

export function KeyValueEditor({
	items,
	onChange,
	keyPlaceholder = "Key",
	valuePlaceholder = "Value",
	addLabel = "Add",
	showFileToggle = false,
	"aria-label": ariaLabel,
}: KeyValueEditorProps) {
	function updateRow(id: string, patch: Partial<KeyValuePair>) {
		onChange(items.map(item => (item.id === id ? { ...item, ...patch } : item)));
	}

	function removeRow(id: string) {
		onChange(items.filter(item => item.id !== id));
	}

	function addRow() {
		onChange([...items, createKeyValuePair("", "", showFileToggle ? "text" : undefined)]);
	}

	return (
		<div className="space-y-2" role="group" aria-label={ariaLabel}>
			{items.map(item => (
				<div key={item.id} className="flex items-center gap-2">
					<label className="inline-flex items-center">
						<span className="sr-only">Enable this row</span>
						<input
							type="checkbox"
							checked={item.enabled}
							onChange={event => updateRow(item.id, { enabled: event.target.checked })}
							className="size-4 rounded border-border accent-primary"
						/>
					</label>

					<input
						type="text"
						value={item.key}
						onChange={event => updateRow(item.id, { key: event.target.value })}
						placeholder={keyPlaceholder}
						aria-label={keyPlaceholder}
						className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>

					<input
						type="text"
						value={item.value}
						onChange={event => updateRow(item.id, { value: event.target.value })}
						placeholder={showFileToggle && item.type === "file" ? "filename.png" : valuePlaceholder}
						aria-label={valuePlaceholder}
						className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>

					{showFileToggle && (
						<button
							type="button"
							onClick={() => updateRow(item.id, { type: item.type === "file" ? "text" : "file" })}
							aria-pressed={item.type === "file"}
							className={cn(
								"shrink-0 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
								item.type === "file"
									? "border-primary/40 bg-primary/10 text-primary-accent"
									: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
							)}
						>
							{item.type === "file" ? "File" : "Text"}
						</button>
					)}

					<button
						type="button"
						onClick={() => removeRow(item.id)}
						aria-label="Remove row"
						className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			))}

			<button
				type="button"
				onClick={addRow}
				className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
			>
				<Plus className="size-3.5" />
				{addLabel}
			</button>
		</div>
	);
}
