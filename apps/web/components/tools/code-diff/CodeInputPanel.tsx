"use client";

import { useRef, useState, type DragEvent } from "react";
import { Braces, Clipboard, FileUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface CodeInputPanelProps {
	title: string;
	value: string;
	onChange: (value: string) => void;
	monacoLanguage: string;
	canFormat: boolean;
	onError: (message: string) => void;
}

function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
}

export function CodeInputPanel({ title, value, onChange, monacoLanguage, canFormat, onError }: CodeInputPanelProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const disabled = !value.trim();

	async function loadFile(file: File | undefined) {
		if (!file) return;

		if (file.size > MAX_FILE_SIZE_BYTES) {
			onError(`"${file.name}" is too large to compare (max 5 MB).`);
			return;
		}

		try {
			const text = await readFileAsText(file);
			onChange(text);
		} catch {
			onError(`Couldn't read "${file.name}". It may not be a text file.`);
		}
	}

	async function handlePaste() {
		try {
			const text = await navigator.clipboard.readText();
			onChange(text);
		} catch {
			onError("Couldn't read from the clipboard — check your browser's clipboard permission.");
		}
	}

	function handleFormat() {
		try {
			onChange(`${JSON.stringify(JSON.parse(value), null, 2)}\n`);
		} catch {
			onError(`${title} isn't valid JSON, so it can't be auto-formatted.`);
		}
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		setIsDraggingOver(false);
		void loadFile(event.dataTransfer.files[0]);
	}

	return (
		<div
			className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
			onDragOver={event => {
				event.preventDefault();
				setIsDraggingOver(true);
			}}
			onDragLeave={() => setIsDraggingOver(false)}
			onDrop={handleDrop}
		>
			<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
				<span className="text-sm font-medium">{title}</span>
				<span className="text-xs text-muted-foreground">{value ? `${value.split("\n").length} lines` : "Empty"}</span>
			</div>

			<CodeEditor value={value} onChange={onChange} language={monacoLanguage} height="380px" placeholder="Paste, upload, or drop code here…" />

			{isDraggingOver && (
				<div className="pointer-events-none absolute inset-x-0 bottom-[49px] top-[45px] flex items-center justify-center border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
					<span className="rounded-md bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-sm">Drop file to load</span>
				</div>
			)}

			<div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
				<Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
					<FileUp className="size-3.5" />
					Upload
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					accept="text/*,.js,.jsx,.ts,.tsx,.json,.html,.css,.sql,.py,.java,.php,.sh,.yaml,.yml,.md,.txt"
					className="hidden"
					onChange={event => {
						void loadFile(event.target.files?.[0]);
						event.target.value = "";
					}}
					aria-label={`Upload file for ${title}`}
				/>

				<Button onClick={handlePaste} variant="outline" size="sm">
					<Clipboard className="size-3.5" />
					Paste
				</Button>

				{canFormat && (
					<Button onClick={handleFormat} variant="outline" size="sm" disabled={disabled} title="Formats JSON with 2-space indentation">
						<Braces className="size-3.5" />
						Format
					</Button>
				)}

				<CopyButton value={value} label="Copy" disabled={disabled} ariaLabel={`Copy ${title}`} />

				<div className="ml-auto">
					<Button onClick={() => onChange("")} variant="ghost" size="sm" disabled={disabled} className={cn("text-destructive hover:bg-destructive-muted")}>
						<Trash2 className="size-3.5" />
						Clear
					</Button>
				</div>
			</div>
		</div>
	);
}
