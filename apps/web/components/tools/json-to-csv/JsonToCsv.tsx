"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { jsonToCsv } from "@/lib/tools/json-to-csv/convert";

const DEFAULT_INPUT = JSON.stringify(
	[
		{ id: 1, name: "Alice", email: "alice@example.com", address: { city: "London" } },
		{ id: 2, name: "Bob", email: "bob@example.com", address: { city: "Berlin" } },
	],
	null,
	2,
);

const DELIMITERS = [
	{ label: "Comma (,)", value: "," },
	{ label: "Semicolon (;)", value: ";" },
	{ label: "Tab", value: "\t" },
];

export function JsonToCsv() {
	const [input, setInput] = useState(DEFAULT_INPUT);
	const [delimiter, setDelimiter] = useState(",");
	const [result, setResult] = useState<ReturnType<typeof jsonToCsv> | null>(null);

	function handleConvert() {
		let parsed: unknown;
		try {
			parsed = JSON.parse(input);
		} catch {
			setResult({ success: false, error: "Input is not valid JSON." });
			return;
		}
		setResult(jsonToCsv(parsed as never, { delimiter }));
	}

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
				<p className="text-muted-foreground">Converts a JSON array of objects into CSV. Processed entirely in your browser.</p>
			</div>

			<ToolPanel title="JSON Input" icon={FileSpreadsheet}>
				<CodeEditor value={input} onChange={setInput} height="320px" />
			</ToolPanel>

			<div className="flex flex-wrap items-center gap-3">
				<label className="flex items-center gap-2 text-sm text-muted-foreground">
					Delimiter
					<select
						value={delimiter}
						onChange={event => setDelimiter(event.target.value)}
						className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						{DELIMITERS.map(option => (
							<option key={option.label} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>
				<Button onClick={handleConvert} variant="primary" size="sm">
					Convert to CSV
				</Button>
			</div>

			{result && !result.success && <ToolAlert variant="error">{result.error}</ToolAlert>}

			{result && result.success && (
				<ToolPanel
					title={`CSV Output (${result.columns.length} columns)`}
					icon={FileSpreadsheet}
					action={
						<div className="flex items-center gap-2">
							<CopyButton value={result.csv} label="Copy" />
							<Button onClick={() => downloadTextFile(result.csv, "data.csv", "text/csv")} variant="outline" size="sm">
								<Download className="size-3.5" />
								Download
							</Button>
						</div>
					}
				>
					<CodeEditor value={result.csv} onChange={() => {}} readOnly optimizeForReadOnly language="plaintext" height="280px" />
				</ToolPanel>
			)}
		</div>
	);
}
