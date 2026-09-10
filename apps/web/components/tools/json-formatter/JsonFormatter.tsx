"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardCheck, FileJson2 } from "lucide-react";

import { downloadTextFile } from "@/lib/download";
import { formatJson, minifyJson, validateJson } from "../../../lib/tools/json/formatter";

import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";

import { ToolActions } from "./ToolActions";

const DEFAULT_JSON = `{
	"name": "JSONDeveloper",
  "version": "1.0.0",
  "features": [
    "JSON Formatter",
    "JSON Validator",
    "JSON Minifier"
  ]
}`;

export function JsonFormatter() {
	const [input, setInput] = useState(DEFAULT_JSON);
	const [output, setOutput] = useState("");
	const [error, setError] = useState("");
	const [status, setStatus] = useState("");

	const handleFormat = () => {
		const result = formatJson(input);

		if (!result.success) {
			setError(result.error ?? "Invalid JSON");
			setStatus("");
			return;
		}

		setOutput(result.data ?? "");
		setError("");
		setStatus("JSON formatted successfully");
	};

	const handleMinify = () => {
		const result = minifyJson(input);

		if (!result.success) {
			setError(result.error ?? "Invalid JSON");
			setStatus("");
			return;
		}

		setOutput(result.data ?? "");
		setError("");
		setStatus("JSON minified successfully");
	};

	const handleValidate = () => {
		const result = validateJson(input);

		if (!result.success) {
			setError(result.error ?? "Invalid JSON");
			setStatus("");
			return;
		}

		setError("");
		setStatus("✓ Valid JSON");
	};

	const handleCopy = async () => {
		if (!output) return;

		await navigator.clipboard.writeText(output);
		setStatus("Copied to clipboard");
	};

	const handleClear = () => {
		setInput("");
		setOutput("");
		setError("");
		setStatus("");
	};

	const handleDownload = () => {
		if (!output) return;

		downloadTextFile(output, "formatted.json", "application/json");
		setStatus("JSON downloaded");
	};

	const inputStats = useMemo(() => getStats(input), [input]);
	const outputStats = useMemo(() => getStats(output), [output]);

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<ToolActions
					onFormat={handleFormat}
					onMinify={handleMinify}
					onValidate={handleValidate}
					onCopy={handleCopy}
					onClear={handleClear}
					onDownload={handleDownload}
					disabled={!input.trim()}
					hasOutput={Boolean(output)}
				/>
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-lg border border-destructive-border bg-destructive-muted p-4 text-sm text-destructive-muted-foreground">
					<AlertCircle className="mt-0.5 size-4 shrink-0" />
					<div>
						<p className="font-medium">Invalid JSON</p>
						<p className="mt-0.5 opacity-90">{error}</p>
					</div>
				</div>
			)}

			{status && !error && (
				<div className="flex items-center gap-3 rounded-lg border border-success-border bg-success-muted p-4 text-sm text-success-muted-foreground">
					<CheckCircle2 className="size-4 shrink-0" />
					<p className="font-medium">{status}</p>
				</div>
			)}

			<div className="grid gap-4 lg:grid-cols-2">
				<ToolPanel title="Input" icon={FileJson2} action={<span className="text-xs text-muted-foreground">{inputStats}</span>} enableFullscreen>
					<CodeEditor value={input} onChange={setInput} />
				</ToolPanel>

				<ToolPanel title="Output" icon={ClipboardCheck} action={<span className="text-xs text-muted-foreground">{outputStats}</span>} enableFullscreen>
					<CodeEditor value={output} onChange={setOutput} readOnly />
				</ToolPanel>
			</div>
		</div>
	);
}

function getStats(value: string): string {
	if (!value) return "Empty";

	const lines = value.split("\n").length;
	const chars = value.length;

	return `${lines} line${lines === 1 ? "" : "s"} · ${chars.toLocaleString()} char${chars === 1 ? "" : "s"}`;
}
