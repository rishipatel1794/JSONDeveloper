"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_ACCEPTED_EXTENSIONS = [".json", ".yaml", ".yml"];

interface OpenApiFileUploadProps {
	onFileLoaded: (text: string, fileName: string) => void;
	acceptedExtensions?: string[];
	tooLargeMessage?: string;
}

export function OpenApiFileUpload({ onFileLoaded, acceptedExtensions = DEFAULT_ACCEPTED_EXTENSIONS, tooLargeMessage }: OpenApiFileUploadProps) {
	const [error, setError] = useState("");
	const [fileName, setFileName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const extensionList = acceptedExtensions.join(", ");

	async function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		const hasAcceptedExtension = acceptedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
		if (!hasAcceptedExtension) {
			setError(`Please choose a ${extensionList} file.`);
			event.target.value = "";
			return;
		}

		if (file.size > MAX_SIZE_BYTES) {
			setError(tooLargeMessage ?? "This file is too large to import.\n\nMaximum supported size is 10 MB.");
			event.target.value = "";
			return;
		}

		setError("");
		const text = await file.text();
		setFileName(file.name);
		onFileLoaded(text, file.name);
	}

	return (
		<div className="rounded-lg border border-dashed border-border p-6 text-center">
			<Upload className="mx-auto size-6 text-muted-foreground" />
			<p className="mt-2 text-sm text-muted-foreground">
				{fileName ? <span className="font-medium text-foreground">{fileName}</span> : `Choose a ${extensionList} file`}
			</p>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
			>
				Choose File
			</button>
			<input ref={inputRef} type="file" accept={acceptedExtensions.join(",")} onChange={handleChange} className="hidden" />
			{error && <p className="mt-2 whitespace-pre-line text-xs text-destructive">{error}</p>}
			<p className="mt-2 text-xs text-subtle-foreground">Parsed entirely in your browser — never uploaded to our server.</p>
		</div>
	);
}
