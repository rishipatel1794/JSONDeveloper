import { Plus, Trash2 } from "lucide-react";

interface Row {
	id: string;
	[key: string]: string;
}

interface TwoFieldListEditorProps<T extends Row> {
	items: T[];
	firstField: keyof T & string;
	secondField: keyof T & string;
	firstPlaceholder: string;
	secondPlaceholder: string;
	addLabel: string;
	createRow: () => T;
	onChange: (items: T[]) => void;
}

/** A generic two-column repeatable row editor — used for ports (host/container) and volumes (source/target). */
export function TwoFieldListEditor<T extends Row>({
	items,
	firstField,
	secondField,
	firstPlaceholder,
	secondPlaceholder,
	addLabel,
	createRow,
	onChange,
}: TwoFieldListEditorProps<T>) {
	function updateRow(id: string, patch: Partial<T>) {
		onChange(items.map(item => (item.id === id ? { ...item, ...patch } : item)));
	}

	function removeRow(id: string) {
		onChange(items.filter(item => item.id !== id));
	}

	return (
		<div className="space-y-2">
			{items.map(item => (
				<div key={item.id} className="flex items-center gap-2">
					<input
						value={item[firstField]}
						onChange={event => updateRow(item.id, { [firstField]: event.target.value } as Partial<T>)}
						placeholder={firstPlaceholder}
						aria-label={firstPlaceholder}
						className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
					<input
						value={item[secondField]}
						onChange={event => updateRow(item.id, { [secondField]: event.target.value } as Partial<T>)}
						placeholder={secondPlaceholder}
						aria-label={secondPlaceholder}
						className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
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
				onClick={() => onChange([...items, createRow()])}
				className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
			>
				<Plus className="size-3.5" />
				{addLabel}
			</button>
		</div>
	);
}
