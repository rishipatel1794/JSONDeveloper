"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";

/** Derived from `OnMount` rather than importing `monaco-editor` directly — it's a transitive dependency, not one of this app's own. */
type MonacoEditorInstance = Parameters<OnMount>[0];
type MonacoMarkerSeverity = Monaco["MarkerSeverity"][keyof Monaco["MarkerSeverity"]];

/** Editor-agnostic marker shape — callers never need to import Monaco's own types. */
export interface EditorMarker {
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
	message: string;
	severity?: "error" | "warning" | "info";
}

const MARKER_OWNER = "code-editor-diagnostics";

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	readOnly?: boolean;
	height?: string;
	language?: string;
	placeholder?: string;
	/** Inline error/warning markers (squiggly underlines + Problems entries) — e.g. a JSON syntax error's exact line/column. */
	markers?: EditorMarker[];
	/** Bumping this (e.g. to a 1-indexed line number) scrolls that line into view and briefly highlights it — used for "jump to this duplicate key". */
	revealLine?: number;
}

export function CodeEditor({
	value,
	onChange,
	readOnly = false,
	height = "480px",
	language = "json",
	placeholder,
	markers,
	revealLine,
}: CodeEditorProps) {
	const resolvedPlaceholder = placeholder ?? (readOnly ? "Output will appear here" : "Paste or type here…");
	const [editorTheme, setEditorTheme] = useState<"vs" | "vs-dark">("vs-dark");

	const editorRef = useRef<MonacoEditorInstance | null>(null);
	const monacoRef = useRef<Monaco | null>(null);

	useEffect(() => {
		function updateThemeFromRootClass() {
			setEditorTheme(document.documentElement.classList.contains("light") ? "vs" : "vs-dark");
		}

		updateThemeFromRootClass();

		const observer = new MutationObserver(updateThemeFromRootClass);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	const handleMount: OnMount = (editorInstance, monacoInstance) => {
		editorRef.current = editorInstance;
		monacoRef.current = monacoInstance;
		applyMarkers(monacoInstance, editorInstance, markers);
	};

	useEffect(() => {
		if (monacoRef.current && editorRef.current) {
			applyMarkers(monacoRef.current, editorRef.current, markers);
		}
	}, [markers]);

	useEffect(() => {
		if (revealLine === undefined) return;
		const editorInstance = editorRef.current;
		if (!editorInstance) return;

		editorInstance.revealLineInCenter(revealLine);
		editorInstance.setPosition({ lineNumber: revealLine, column: 1 });
	}, [revealLine]);

	return (
		<Editor
			height={height}
			defaultLanguage={language}
			language={language}
			value={value}
			onChange={value => onChange(value ?? "")}
			onMount={handleMount}
			theme={editorTheme}
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

function severityToMonaco(monaco: Monaco, severity: EditorMarker["severity"]): MonacoMarkerSeverity {
	switch (severity) {
		case "warning":
			return monaco.MarkerSeverity.Warning;
		case "info":
			return monaco.MarkerSeverity.Info;
		default:
			return monaco.MarkerSeverity.Error;
	}
}

function applyMarkers(monaco: Monaco, editorInstance: MonacoEditorInstance, markers: EditorMarker[] | undefined): void {
	const model = editorInstance.getModel();
	if (!model) return;

	monaco.editor.setModelMarkers(
		model,
		MARKER_OWNER,
		(markers ?? []).map(marker => ({
			startLineNumber: marker.startLineNumber,
			startColumn: marker.startColumn,
			endLineNumber: marker.endLineNumber,
			endColumn: marker.endColumn,
			message: marker.message,
			severity: severityToMonaco(monaco, marker.severity),
		})),
	);
}
