"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	readOnly?: boolean;
	height?: string;
	language?: string;
	placeholder?: string;
}

export function CodeEditor({
	value,
	onChange,
	readOnly = false,
	height = "480px",
	language = "json",
	placeholder,
}: CodeEditorProps) {
	const resolvedPlaceholder = placeholder ?? (readOnly ? "Output will appear here" : "Paste or type here…");

	return (
		<Editor
			height={height}
			defaultLanguage={language}
			language={language}
			value={value}
			onChange={value => onChange(value ?? "")}
			theme="vs-dark"
			loading={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading editor…</div>}
			options={{
				readOnly,
				minimap: {
					enabled: false,
				},
				mouseWheelZoom: true,
				fontSize: 14,
				lineHeight: 22,
				wordWrap: "on",
				automaticLayout: true,
				formatOnPaste: true,
				formatOnType: false,
				scrollBeyondLastLine: false,
				padding: {
					top: 12,
					bottom: 12,
				},
				tabSize: 2,
				renderLineHighlight: readOnly ? "none" : "line",
				placeholder: resolvedPlaceholder,
			}}
		/>
	);
}
