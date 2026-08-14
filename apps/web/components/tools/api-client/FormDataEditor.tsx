"use client";

import { useRef, useState } from "react";
import { Paperclip, Plus, Trash2, X } from "lucide-react";

import { MAX_FORM_FILE_SIZE_BYTES } from "@/lib/api-client/client";
import { createKeyValuePair, type KeyValuePair } from "@/lib/tools/shared/http";
import { cn } from "@/lib/utils";

interface FormDataEditorProps {
	items: KeyValuePair[];
	onChange: (items: KeyValuePair[]) => void;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

/**
 * Multipart form fields for the "Form Data" body type. Unlike the cURL Generator's form-data editor
 * (which only ever needs a filename string for the generated -F flag), the API Client executes real
 * requests, so a "file" field here holds actual content — read client-side into a data URL, sent to
 * the proxy base64-encoded, and reassembled into a real multipart body server-side.
 */
export function FormDataEditor({ items, onChange }: FormDataEditorProps) {
	const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
	const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

	function updateRow(id: string, patch: Partial<KeyValuePair>) {
		onChange(items.map(item => (item.id === id ? { ...item, ...patch } : item)));
	}

	function removeRow(id: string) {
		onChange(items.filter(item => item.id !== id));
		setFileErrors(prev => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	}

	function addRow() {
		onChange([...items, createKeyValuePair("", "", "text")]);
	}

	function toggleType(item: KeyValuePair) {
		const nextType = item.type === "file" ? "text" : "file";
		updateRow(item.id, { type: nextType, value: "", fileName: undefined });
		setFileErrors(prev => {
			const next = { ...prev };
			delete next[item.id];
			return next;
		});
	}

	async function handleFileSelected(id: string, file: File | undefined) {
		if (!file) return;

		if (file.size > MAX_FORM_FILE_SIZE_BYTES) {
			setFileErrors(prev => ({ ...prev, [id]: `"${file.name}" is ${formatFileSize(file.size)} — the limit is ${formatFileSize(MAX_FORM_FILE_SIZE_BYTES)}.` }));
			return;
		}

		setFileErrors(prev => {
			const next = { ...prev };
			delete next[id];
			return next;
		});

		const dataUrl = await readFileAsDataUrl(file);
		updateRow(id, { value: dataUrl, fileName: file.name });
	}

	return (
		<div className="space-y-2" role="group" aria-label="Form data fields">
			{items.map(item => (
				<div key={item.id}>
					<div className="flex items-center gap-2">
						<label className="inline-flex items-center">
							<span className="sr-only">Enable this field</span>
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
							placeholder="Key"
							aria-label="Field key"
							className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>

						<div className="min-w-0 flex-[2]">
							{item.type === "file" ? (
								item.fileName ? (
									<div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm">
										<Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
										<span className="min-w-0 flex-1 truncate text-foreground">{item.fileName}</span>
										<button
											type="button"
											onClick={() => updateRow(item.id, { value: "", fileName: undefined })}
											aria-label="Remove file"
											className="shrink-0 text-muted-foreground hover:text-foreground"
										>
											<X className="size-3.5" />
										</button>
									</div>
								) : (
									<button
										type="button"
										onClick={() => fileInputRefs.current.get(item.id)?.click()}
										className="w-full rounded-md border border-dashed border-border bg-background px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
									>
										Choose File…
									</button>
								)
							) : (
								<input
									type="text"
									value={item.value}
									onChange={event => updateRow(item.id, { value: event.target.value })}
									placeholder="Value"
									aria-label="Field value"
									className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								/>
							)}

							<input
								ref={el => {
									if (el) fileInputRefs.current.set(item.id, el);
									else fileInputRefs.current.delete(item.id);
								}}
								type="file"
								onChange={event => handleFileSelected(item.id, event.target.files?.[0])}
								className="hidden"
							/>
						</div>

						<button
							type="button"
							onClick={() => toggleType(item)}
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

						<button
							type="button"
							onClick={() => removeRow(item.id)}
							aria-label="Remove field"
							className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
						>
							<Trash2 className="size-4" />
						</button>
					</div>

					{fileErrors[item.id] && <p className="mt-1 pl-8 text-xs text-destructive">{fileErrors[item.id]}</p>}
				</div>
			))}

			<button
				type="button"
				onClick={addRow}
				className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
			>
				<Plus className="size-3.5" />
				Add Field
			</button>

			<p className="text-xs text-subtle-foreground">Files are read locally and sent with the request — up to {formatFileSize(MAX_FORM_FILE_SIZE_BYTES)} each.</p>
		</div>
	);
}
