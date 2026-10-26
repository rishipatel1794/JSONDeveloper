"use client";

import { useRef, useState, type DragEvent } from "react";
import { Braces, Download, FileUp, Minimize2, Shuffle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor, type EditorMarker } from "@/components/tools/shared/CodeEditor";
import { downloadTextFile } from "@/lib/download";
import { formatJson, minifyJson } from "@/lib/tools/json/formatter";
import { cn } from "@/lib/utils";

import { SAMPLE_DOCUMENTS } from "@/lib/tools/json-visualizer/samples";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface VisualizerInputPanelProps {
	value: string;
	onChange: (value: string) => void;
	markers: EditorMarker[];
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

export function VisualizerInputPanel({ value, onChange, markers, onError }: VisualizerInputPanelProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const disabled = !value.trim();

	async function loadFile(file: File | undefined) {
		if (!file) return;
		if (file.size > MAX_FILE_SIZE_BYTES) {
			onError(`"${file.name}" is too large (max ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB).`);
			return;
		}
		try {
			onChange(await readFileAsText(file));
		} catch {
			onError(`Couldn't read "${file.name}".`);
		}
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		setIsDraggingOver(false);
		void loadFile(event.dataTransfer.files[0]);
	}

	function handleFormat() {
		const result = formatJson(value);
		if (result.success && result.data) onChange(result.data);
		else onError("Can't format — the input isn't valid JSON.");
	}

	function handleMinify() {
		const result = minifyJson(value);
		if (result.success && result.data) onChange(result.data);
		else onError("Can't minify — the input isn't valid JSON.");
	}

	function loadSample() {
		const sample = SAMPLE_DOCUMENTS[Math.floor(Math.random() * SAMPLE_DOCUMENTS.length)]!;
		onChange(sample.json);
	}

	return (
		<div
			className="relative rounded-xl border border-border bg-card shadow-sm"
			onDragOver={event => {
				event.preventDefault();
				setIsDraggingOver(true);
			}}
			onDragLeave={() => setIsDraggingOver(false)}
			onDrop={handleDrop}
		>
			<CodeEditor value={value} onChange={onChange} markers={markers} height="320px" placeholder="Paste, upload, or drop a JSON file here…" />

			{isDraggingOver && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
					<span className="rounded-md bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-sm">Drop file to load</span>
				</div>
			)}

			<div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2.5">
				<Button onClick={handleFormat} variant="outline" size="sm" disabled={disabled}>
					<Braces className="size-3.5" />
					Format
				</Button>
				<Button onClick={handleMinify} variant="outline" size="sm" disabled={disabled}>
					<Minimize2 className="size-3.5" />
					Minify
				</Button>
				<CopyButton value={value} label="Copy" disabled={disabled} />
				<Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
					<FileUp className="size-3.5" />
					Upload
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					accept="application/json,.json,text/plain"
					className="hidden"
					onChange={event => {
						void loadFile(event.target.files?.[0]);
						event.target.value = "";
					}}
					aria-label="Upload a JSON file"
				/>
				<Button onClick={() => downloadTextFile(value, "data.json", "application/json")} variant="outline" size="sm" disabled={disabled}>
					<Download className="size-3.5" />
					Download
				</Button>
				<Button onClick={loadSample} variant="outline" size="sm">
					<Shuffle className="size-3.5" />
					Sample
				</Button>

				<Button onClick={() => onChange("")} variant="ghost" size="sm" disabled={disabled} className={cn("ml-auto text-destructive hover:bg-destructive-muted")}>
					<Trash2 className="size-3.5" />
					Clear
				</Button>
			</div>
		</div>
	);
}
