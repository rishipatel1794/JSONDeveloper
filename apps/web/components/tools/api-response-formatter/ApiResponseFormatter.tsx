"use client";

import { useEffect, useMemo, useState } from "react";
import { Braces, Download, Minimize2, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { TabList, TabPanel } from "@/components/ui/Tabs";
import { CodeEditor, type EditorMarker } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { JsonTree } from "@/components/tools/json-validator/JsonTree";
import { downloadTextFile } from "@/lib/download";
import { analyzeApiResponse } from "@/lib/tools/api-response-formatter/analyzer";
import type { ResponseMeta } from "@/lib/tools/api-response-formatter/types";
import { buildJsonTree } from "@/lib/tools/json-validator/json-path";
import type { JsonTreeNode } from "@/lib/tools/json-validator/types";
import { validateAndAnalyze } from "@/lib/tools/json-validator/validator";
import { formatJson, minifyJson } from "@/lib/tools/json/formatter";

import { AnalysisView } from "./AnalysisView";
import { ApiResponseFormatterPrivacyNotice } from "./ApiResponseFormatterPrivacyNotice";
import { ResponseMetaFields } from "./ResponseMetaFields";
import { ResponsePatternsReference } from "./ResponsePatternsReference";
import { ResponseSummaryView } from "./ResponseSummaryView";

const DEBOUNCE_MS = 350;
const MAX_INPUT_BYTES = 5_000_000;

const DEFAULT_INPUT = `{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Example User"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 1
  }
}`;

type OutputTab = "formatted" | "structure" | "analysis" | "summary";

const TABS: Array<{ value: OutputTab; label: string }> = [
	{ value: "formatted", label: "Formatted JSON" },
	{ value: "structure", label: "Structure" },
	{ value: "analysis", label: "API Analysis" },
	{ value: "summary", label: "Response Summary" },
];

export function ApiResponseFormatter() {
	const [input, setInput] = useState(DEFAULT_INPUT);
	const [debouncedInput, setDebouncedInput] = useState(DEFAULT_INPUT);
	const [meta, setMeta] = useState<ResponseMeta>({});
	const [activeTab, setActiveTab] = useState<OutputTab>("formatted");
	const [selectedNode, setSelectedNode] = useState<JsonTreeNode | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedInput(input), DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [input]);

	const tooLarge = useMemo(() => new TextEncoder().encode(debouncedInput).byteLength > MAX_INPUT_BYTES, [debouncedInput]);
	const result = useMemo(() => (tooLarge ? null : validateAndAnalyze(debouncedInput)), [debouncedInput, tooLarge]);

	const tree = useMemo(() => (result?.valid && result.value !== undefined ? buildJsonTree(result.value) : null), [result]);

	const formattedOutput = useMemo(() => {
		if (!result?.valid) return "";
		const formatted = formatJson(debouncedInput);
		return formatted.success && formatted.data ? formatted.data : debouncedInput;
	}, [result, debouncedInput]);

	const findings = useMemo(() => {
		if (!result?.valid || result.value === undefined) return [];
		return analyzeApiResponse(result.value, meta, result.statistics?.maxDepth ?? 0);
	}, [result, meta]);

	const markers: EditorMarker[] = useMemo(() => {
		if (!result || result.valid || !result.error) return [];
		const column = Math.max(1, result.error.column);
		return [
			{
				startLineNumber: result.error.line,
				startColumn: column,
				endLineNumber: result.error.line,
				endColumn: column + 1,
				message: result.error.friendlyMessage,
				severity: "error",
			},
		];
	}, [result]);

	function handleFormat() {
		const formatted = formatJson(input);
		if (formatted.success && formatted.data) setInput(formatted.data);
	}

	function handleMinify() {
		const minified = minifyJson(input);
		if (minified.success && minified.data) setInput(minified.data);
	}

	function handleValidateNow() {
		setDebouncedInput(input);
	}

	function handleReset() {
		setInput(DEFAULT_INPUT);
		setDebouncedInput(DEFAULT_INPUT);
		setMeta({});
		setSelectedNode(null);
		setSearchQuery("");
	}

	function handleDownload() {
		downloadTextFile(formattedOutput || input, "api-response.json", "application/json");
	}

	const rootType = result?.valid && result.value !== undefined ? (Array.isArray(result.value) ? "array" : result.value === null ? "null" : typeof result.value) : "—";

	return (
		<div className="space-y-4">
			<ApiResponseFormatterPrivacyNotice />

			<ToolPanel title="API Response" icon={Braces} enableFullscreen>
				<div className="space-y-3 p-3">
					<ResponseMetaFields meta={meta} onChange={setMeta} />
					<CodeEditor value={input} onChange={setInput} markers={markers} height="360px" placeholder="Paste an API response body here…" />
				</div>
			</ToolPanel>

			<div className="flex flex-wrap items-center gap-2">
				<Button onClick={handleValidateNow} variant="primary" size="sm">
					Validate JSON
				</Button>
				<Button onClick={handleFormat} variant="outline" size="sm">
					<Braces className="size-3.5" />
					Format
				</Button>
				<Button onClick={handleMinify} variant="outline" size="sm">
					<Minimize2 className="size-3.5" />
					Minify
				</Button>
				<CopyButton value={formattedOutput || input} label="Copy Result" />
				<Button onClick={handleDownload} variant="outline" size="sm" disabled={!result?.valid}>
					<Download className="size-3.5" />
					Download JSON
				</Button>
				<Button onClick={handleReset} variant="ghost" size="sm" className="ml-auto">
					<RotateCcw className="size-3.5" />
					Reset
				</Button>
			</div>

			{tooLarge && (
				<div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
					This input is larger than {Math.round(MAX_INPUT_BYTES / 1_000_000)}MB. Reduce its size to analyze it in the browser.
				</div>
			)}

			{!tooLarge && result && !result.valid && result.error && (
				<div className="rounded-lg border border-destructive-border bg-destructive-muted p-4 text-sm text-destructive-muted-foreground">
					<p className="font-medium">Invalid JSON</p>
					<p className="mt-0.5">
						Line {result.error.line}, column {result.error.column}: {result.error.friendlyMessage}
					</p>
				</div>
			)}

			{!tooLarge && result?.valid && (
				<div>
					<TabList items={TABS} value={activeTab} onChange={value => setActiveTab(value as OutputTab)} aria-label="Output view" />

					<div className="pt-4">
						<TabPanel value="formatted" activeValue={activeTab}>
							<CodeEditor value={formattedOutput} onChange={() => {}} readOnly optimizeForReadOnly height="420px" />
						</TabPanel>

						<TabPanel value="structure" activeValue={activeTab}>
							{tree ? (
								<div className="space-y-2">
									<div className="relative">
										<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
										<input
											type="search"
											value={searchQuery}
											onChange={event => setSearchQuery(event.target.value)}
											placeholder="Search keys or values…"
											className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</div>
									<JsonTree root={tree.root} truncated={tree.truncated} selectedPath={selectedNode?.path ?? null} onSelect={setSelectedNode} searchQuery={searchQuery} />
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No structure to display.</p>
							)}
						</TabPanel>

						<TabPanel value="analysis" activeValue={activeTab}>
							<div className="space-y-6">
								<AnalysisView findings={findings} />
								<ResponsePatternsReference />
							</div>
						</TabPanel>

						<TabPanel value="summary" activeValue={activeTab}>
							<ResponseSummaryView meta={meta} rootType={rootType} statistics={result.statistics ?? null} formattedOutput={formattedOutput} />
						</TabPanel>
					</div>
				</div>
			)}
		</div>
	);
}
