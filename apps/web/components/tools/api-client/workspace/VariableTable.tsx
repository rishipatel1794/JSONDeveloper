"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import { isValidVariableName } from "@/lib/api-client/storage/variables";
import type { Variable } from "@/lib/api-client/workspace/types";
import { cn } from "@/lib/utils";

interface VariableTableProps {
	variables: Variable[];
	onChange: (variables: Variable[]) => void;
	onAdd: () => void;
}

export function VariableTable({ variables, onChange, onAdd }: VariableTableProps) {
	const [revealed, setRevealed] = useState<Set<string>>(new Set());

	function updateRow(id: string, patch: Partial<Variable>) {
		onChange(variables.map(variable => (variable.id === id ? { ...variable, ...patch } : variable)));
	}

	function removeRow(id: string) {
		onChange(variables.filter(variable => variable.id !== id));
	}

	function toggleReveal(id: string) {
		setRevealed(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	return (
		<div className="space-y-2">
			{variables.length === 0 && <p className="text-sm text-muted-foreground">No variables yet.</p>}

			{variables.map(variable => {
				const invalidName = variable.key.trim().length > 0 && !isValidVariableName(variable.key);
				const isRevealed = revealed.has(variable.id) || !variable.secret;

				return (
					<div key={variable.id} className="flex items-start gap-2">
						<input
							type="checkbox"
							checked={variable.enabled}
							onChange={event => updateRow(variable.id, { enabled: event.target.checked })}
							aria-label="Enable variable"
							className="mt-2.5 size-4 shrink-0 rounded border-border accent-primary"
						/>

						<div className="min-w-0 flex-1">
							<input
								type="text"
								value={variable.key}
								onChange={event => updateRow(variable.id, { key: event.target.value })}
								placeholder="VARIABLE_NAME"
								aria-label="Variable name"
								spellCheck={false}
								className={cn(
									"w-full rounded-md border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									invalidName ? "border-destructive" : "border-border",
								)}
							/>
							{invalidName && <p className="mt-0.5 text-xs text-destructive">Letters, numbers, underscores only — can&apos;t start with a number.</p>}
						</div>

						<div className="relative min-w-0 flex-1">
							<input
								type={isRevealed ? "text" : "password"}
								value={variable.value}
								onChange={event => updateRow(variable.id, { value: event.target.value })}
								placeholder="Value"
								aria-label="Variable value"
								spellCheck={false}
								className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 pr-8 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							/>
							{variable.secret && (
								<button
									type="button"
									onClick={() => toggleReveal(variable.id)}
									aria-label={isRevealed ? "Hide value" : "Show value"}
									className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{isRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
								</button>
							)}
						</div>

						<label className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
							<input
								type="checkbox"
								checked={Boolean(variable.secret)}
								onChange={event => updateRow(variable.id, { secret: event.target.checked })}
								className="size-3.5 rounded border-border accent-primary"
							/>
							Secret
						</label>

						<button
							type="button"
							onClick={() => removeRow(variable.id)}
							aria-label="Remove variable"
							className="mt-1 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
						>
							<Trash2 className="size-4" />
						</button>
					</div>
				);
			})}

			<button
				type="button"
				onClick={onAdd}
				className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
			>
				<Plus className="size-3.5" />
				Add Variable
			</button>
		</div>
	);
}
