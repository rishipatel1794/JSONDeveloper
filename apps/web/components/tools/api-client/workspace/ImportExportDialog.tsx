"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { downloadTextFile } from "@/lib/download";
import { exportWorkspace, importWorkspace } from "@/lib/api-client/storage/workspace";

interface ImportExportDialogProps {
	open: boolean;
	onClose: () => void;
	onImported: () => void;
}

export function ImportExportDialog({ open, onClose, onImported }: ImportExportDialogProps) {
	const [includeSecrets, setIncludeSecrets] = useState(false);
	const [importError, setImportError] = useState("");
	const [importSuccess, setImportSuccess] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleExport() {
		const data = await exportWorkspace(includeSecrets);
		downloadTextFile(JSON.stringify(data, null, 2), "developer-tools-workspace.json", "application/json");
	}

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setImportError("");
		setImportSuccess(false);

		try {
			const text = await file.text();
			const parsed: unknown = JSON.parse(text);
			const result = await importWorkspace(parsed);

			if (result.success) {
				setImportSuccess(true);
				onImported();
			} else {
				setImportError(result.error ?? "Unable to import this workspace file.");
			}
		} catch {
			setImportError("This file isn't valid JSON.");
		} finally {
			event.target.value = "";
		}
	}

	return (
		<Dialog open={open} onClose={onClose} title="Import / Export Workspace">
			<div className="space-y-5">
				<div>
					<h3 className="text-sm font-semibold text-foreground">Export Workspace</h3>

					<label className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
						<input
							type="checkbox"
							checked={includeSecrets}
							onChange={event => setIncludeSecrets(event.target.checked)}
							className="mt-0.5 size-4 rounded border-border accent-primary"
						/>
						Include secret variables
					</label>

					{includeSecrets && (
						<div className="mt-2">
							<ToolAlert variant="warning">
								Exporting secrets can expose API credentials. Only share this file with people you trust.
							</ToolAlert>
						</div>
					)}

					<Button onClick={handleExport} variant="outline" size="sm" className="mt-3">
						Export Workspace
					</Button>
				</div>

				<div className="border-t border-border-subtle pt-4">
					<h3 className="text-sm font-semibold text-foreground">Import Workspace</h3>
					<p className="mt-1 text-xs text-muted-foreground">This replaces your current workspace with the contents of the file.</p>

					<input
						ref={fileInputRef}
						type="file"
						accept="application/json"
						onChange={handleFileChange}
						className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
					/>

					{importError && <p className="mt-2 text-xs text-destructive">{importError}</p>}
					{importSuccess && <p className="mt-2 text-xs text-success">Workspace imported successfully.</p>}
				</div>
			</div>

			<div className="mt-5 flex justify-end">
				<Button onClick={onClose} variant="ghost">
					Close
				</Button>
			</div>
		</Dialog>
	);
}
