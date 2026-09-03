"use client";

import { useMemo, useState } from "react";
import { AlertCircle, FileJson2, Minimize2, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { downloadTextFile } from "@/lib/download";
import { minifyJson } from "@/lib/tools/json/formatter";
import { formatBytes } from "@/lib/tools/json-validator/utils";

const EXAMPLE_JSON = `{
  "name": "JSONDeveloper",
  "version": "1.0.0",
  "features": [
    "JSON Formatter",
    "JSON Validator",
    "JSON Minifier"
  ]
}`;

export function JsonMinifier() {
	const [input, setInput] = useState(EXAMPLE_JSON);

	const { output, error } = useMemo(() => {
		if (!input.trim()) return { output: "", error: null };
		const result = minifyJson(input);
		return result.success ? { output: result.data ?? "", error: null } : { output: "", error: result.error ?? "Invalid JSON" };
	}, [input]);

	const inputBytes = new TextEncoder().encode(input).length;
	const outputBytes = new TextEncoder().encode(output).length;
	const reduction = inputBytes > 0 && output ? Math.round((1 - outputBytes / inputBytes) * 100) : null;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					{output ? (
						<>
							<span className="font-medium text-foreground">{formatBytes(inputBytes)}</span>
							<span aria-hidden="true">→</span>
							<span className="font-medium text-foreground">{formatBytes(outputBytes)}</span>
							{reduction !== null && reduction > 0 && (
								<span className="rounded-full border border-success-border bg-success-muted px-2 py-0.5 text-xs font-medium text-success-muted-foreground">
									-{reduction}%
								</span>
							)}
						</>
					) : (
						"Paste JSON to see the size reduction"
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button onClick={() => setInput(EXAMPLE_JSON)} variant="ghost" size="sm">
						<Sparkles className="size-3.5" />
						Load Example
					</Button>
					<Button onClick={() => setInput("")} variant="ghost" size="sm" disabled={!input} className="text-destructive hover:bg-destructive-muted">
						<Trash2 className="size-3.5" />
						Clear
					</Button>
				</div>
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

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
					<div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2.5">
						<div className="flex items-center gap-2 text-sm font-medium">
							<FileJson2 className="size-4 text-muted-foreground" />
							JSON Input
						</div>
						<span className="text-xs text-muted-foreground">{formatBytes(inputBytes)}</span>
					</div>

					<CodeEditor value={input} onChange={setInput} placeholder="Paste JSON here…" />
				</div>

				<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
					<div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2.5">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Minimize2 className="size-4 text-muted-foreground" />
							Minified
						</div>
						{output && (
							<div className="flex items-center gap-2">
								<CopyButton value={output} ariaLabel="Copy minified JSON" />
								<Button onClick={() => downloadTextFile(output, "minified.json", "application/json")} variant="outline" size="sm">
									Download
								</Button>
							</div>
						)}
					</div>

					<CodeEditor value={output} onChange={() => {}} readOnly placeholder="Minified JSON will appear here" wordWrap="on" />
				</div>
			</div>
		</div>
	);
}
