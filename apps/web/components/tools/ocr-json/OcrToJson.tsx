"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ScanText, Table2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { convertOcrResponseToJson } from "@/lib/tools/ocr-json/parser";
import { OCR_EXAMPLE_RESPONSE } from "@/lib/tools/ocr-json/example";

export function OcrToJson() {
	const [input, setInput] = useState("");

	const { output, error, rowCount, unlabeledCount } = useMemo(() => {
		if (!input.trim()) return { output: "", error: null, rowCount: 0, unlabeledCount: 0 };

		const result = convertOcrResponseToJson(input);

		if (!result.success || !result.data) {
			return { output: "", error: result.error ?? "Unable to convert this OCR response.", rowCount: 0, unlabeledCount: 0 };
		}

		return {
			output: JSON.stringify(result.data, null, 2),
			error: null,
			rowCount: result.data.table.length,
			unlabeledCount: result.data.unlabeled.length,
		};
	}, [input]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					{output ? (
						<>
							<span className="font-medium text-foreground">{rowCount}</span> field{rowCount === 1 ? "" : "s"} extracted
							{unlabeledCount > 0 && (
								<span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
									{unlabeledCount} unlabeled fragment{unlabeledCount === 1 ? "" : "s"}
								</span>
							)}
						</>
					) : (
						"Paste an OCR response to convert it into structured JSON"
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button onClick={() => setInput(OCR_EXAMPLE_RESPONSE)} variant="ghost" size="sm">
						Load Example
					</Button>
					<Button onClick={() => setInput("")} variant="ghost" size="sm" disabled={!input} className="text-destructive hover:bg-destructive-muted">
						Clear
					</Button>
				</div>
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-lg border border-destructive-border bg-destructive-muted p-4 text-sm text-destructive-muted-foreground">
					<AlertCircle className="mt-0.5 size-4 shrink-0" />
					<div>
						<p className="font-medium">Could not convert this response</p>
						<p className="mt-0.5 opacity-90">{error}</p>
					</div>
				</div>
			)}

			<div className="grid gap-4 lg:grid-cols-2">
				<ToolPanel title="OCR Response" icon={ScanText} enableFullscreen>
					<CodeEditor value={input} onChange={setInput} language="json" placeholder="Paste the OCR/document-parsing response here…" />
				</ToolPanel>

				<ToolPanel
					title="Structured JSON"
					icon={Table2}
					enableFullscreen
					action={
						output && (
							<div className="flex items-center gap-2">
								<CopyButton value={output} ariaLabel="Copy structured JSON" />
								<Button onClick={() => downloadTextFile(output, "ocr-result.json", "application/json")} variant="outline" size="sm">
									Download
								</Button>
							</div>
						)
					}
				>
					<CodeEditor value={output} onChange={() => {}} language="json" readOnly placeholder="Structured JSON will appear here" />
				</ToolPanel>
			</div>
		</div>
	);
}
