"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { nameSuggestsSecret } from "@/lib/api-client/storage/variables";
import { extractJsonValue, isJwtLike } from "@/lib/api-client/variables/extractor";
import type { Environment, VariableScope } from "@/lib/api-client/workspace/types";
import { cn } from "@/lib/utils";

export interface ExtractionRow {
	id: string;
	responsePath: string;
	variableName: string;
	scope: VariableScope;
	environmentId?: string;
	secret: boolean;
}

interface ExtractVariableModalProps {
	open: boolean;
	responseBody: string;
	initialRows?: ExtractionRow[];
	environments: Environment[];
	activeEnvironmentId: string | null;
	/** Only offered when extracting from an already-saved request. */
	offerAutoExtract?: boolean;
	onCancel: () => void;
	onSave: (rows: ExtractionRow[], saveForAutoExtract: boolean) => void;
}

function emptyRow(activeEnvironmentId: string | null): ExtractionRow {
	return {
		id: crypto.randomUUID(),
		responsePath: "",
		variableName: "",
		scope: "environment",
		environmentId: activeEnvironmentId ?? undefined,
		secret: false,
	};
}

export function ExtractVariableModal({
	open,
	responseBody,
	initialRows,
	environments,
	activeEnvironmentId,
	offerAutoExtract,
	onCancel,
	onSave,
}: ExtractVariableModalProps) {
	const [rows, setRows] = useState<ExtractionRow[]>(() => (initialRows && initialRows.length > 0 ? initialRows : [emptyRow(activeEnvironmentId)]));
	const [saveForAutoExtract, setSaveForAutoExtract] = useState(false);

	useEffect(() => {
		if (open) {
			setRows(initialRows && initialRows.length > 0 ? initialRows : [emptyRow(activeEnvironmentId)]);
			setSaveForAutoExtract(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	function updateRow(id: string, patch: Partial<ExtractionRow>) {
		setRows(prev =>
			prev.map(row => {
				if (row.id !== id) return row;
				const next = { ...row, ...patch };

				// Nudge the secret checkbox on when the path/name/value looks credential-like — the user
				// still has to confirm it, this never saves anything on its own.
				if (patch.responsePath !== undefined || patch.variableName !== undefined) {
					const preview = extractJsonValue(responseBody, next.responsePath);
					const previewValue = preview.success ? String(preview.value) : "";
					if (!row.secret && (nameSuggestsSecret(next.variableName) || isJwtLike(previewValue))) {
						next.secret = true;
					}
				}

				return next;
			}),
		);
	}

	function removeRow(id: string) {
		setRows(prev => prev.filter(row => row.id !== id));
	}

	function addRow() {
		setRows(prev => [...prev, emptyRow(activeEnvironmentId)]);
	}

	function handleSave() {
		const validRows = rows.filter(row => row.responsePath.trim() && row.variableName.trim());
		if (validRows.length > 0) onSave(validRows, saveForAutoExtract);
	}

	return (
		<Dialog open={open} onClose={onCancel} title="Extract Variable" description="Save a value from this response as a variable." className="max-w-2xl">
			<div className="space-y-4">
				{rows.map(row => {
					const preview = row.responsePath.trim() ? extractJsonValue(responseBody, row.responsePath) : null;

					return (
						<div key={row.id} className="rounded-md border border-border p-3">
							<div className="grid gap-3 sm:grid-cols-2">
								<label className="block">
									<span className="mb-1 block text-xs font-medium text-muted-foreground">Response Path</span>
									<input
										type="text"
										value={row.responsePath}
										onChange={event => updateRow(row.id, { responsePath: event.target.value })}
										placeholder="data.access_token"
										spellCheck={false}
										className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									/>
								</label>

								<label className="block">
									<span className="mb-1 block text-xs font-medium text-muted-foreground">Variable Name</span>
									<input
										type="text"
										value={row.variableName}
										onChange={event => updateRow(row.id, { variableName: event.target.value.toUpperCase() })}
										placeholder="ACCESS_TOKEN"
										spellCheck={false}
										className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									/>
								</label>
							</div>

							<div className="mt-2 rounded-md bg-secondary px-2.5 py-1.5 font-mono text-xs">
								{!row.responsePath.trim() ? (
									<span className="text-subtle-foreground">Preview will appear here</span>
								) : preview?.success ? (
									<span className="break-all text-foreground">{String(preview.value)}</span>
								) : (
									<span className="text-destructive">{preview?.error}</span>
								)}
							</div>

							<div className="mt-2 flex flex-wrap items-center gap-3">
								<label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
									<span>Scope</span>
									<select
										value={row.scope}
										onChange={event => updateRow(row.id, { scope: event.target.value as VariableScope })}
										className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
									>
										<option value="global">Global</option>
										<option value="environment">Environment</option>
									</select>
								</label>

								{row.scope === "environment" && (
									<select
										value={row.environmentId ?? ""}
										onChange={event => updateRow(row.id, { environmentId: event.target.value || undefined })}
										className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
									>
										<option value="" disabled>
											Choose environment
										</option>
										{environments.map(environment => (
											<option key={environment.id} value={environment.id}>
												{environment.name}
											</option>
										))}
									</select>
								)}

								<label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
									<input
										type="checkbox"
										checked={row.secret}
										onChange={event => updateRow(row.id, { secret: event.target.checked })}
										className="size-3.5 rounded border-border accent-primary"
									/>
									Secret variable
								</label>

								{rows.length > 1 && (
									<button
										type="button"
										onClick={() => removeRow(row.id)}
										aria-label="Remove this extraction rule"
										className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-destructive-muted hover:text-destructive"
									>
										<Trash2 className="size-3.5" />
									</button>
								)}
							</div>
						</div>
					);
				})}

				<button
					type="button"
					onClick={addRow}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
					)}
				>
					<Plus className="size-3.5" />
					Add another
				</button>

				{offerAutoExtract && (
					<label className="flex items-start gap-2 text-sm text-muted-foreground">
						<input
							type="checkbox"
							checked={saveForAutoExtract}
							onChange={event => setSaveForAutoExtract(event.target.checked)}
							className="mt-0.5 size-4 rounded border-border accent-primary"
						/>
						Run these extraction rules automatically every time this request is sent
					</label>
				)}
			</div>

			<div className="mt-5 flex justify-end gap-2">
				<Button onClick={onCancel} variant="ghost">
					Cancel
				</Button>
				<Button onClick={handleSave}>Save Variable{rows.length > 1 ? "s" : ""}</Button>
			</div>
		</Dialog>
	);
}
