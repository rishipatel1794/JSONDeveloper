"use client";

import { useEffect, useMemo, useState } from "react";

import { TabList, TabPanel } from "@/components/ui/Tabs";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { CodeEditor, type EditorMarker } from "@/components/tools/shared/CodeEditor";
import { JsonTree } from "@/components/tools/json-validator/JsonTree";
import { buildJsonTree } from "@/lib/tools/json-validator/json-path";
import type { JsonTreeNode } from "@/lib/tools/json-validator/types";
import { validateAndAnalyze } from "@/lib/tools/json-validator/validator";
import { formatJson } from "@/lib/tools/json/formatter";
import { buildTransferRequestMessage, parseExtensionLoadJsonMessage } from "@/lib/tools/json-visualizer/extensionBridge";

import { GraphView } from "./GraphView";
import { TableView } from "./TableView";
import { VisualizerInputPanel } from "./VisualizerInputPanel";
import { VisualizerPrivacyNotice } from "./VisualizerPrivacyNotice";

const DEBOUNCE_MS = 300;
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

const DEFAULT_INPUT = JSON.stringify(
	{
		id: 1024,
		name: "Ada Lovelace",
		active: true,
		roles: ["admin", "editor"],
		address: { city: "London", country: "UK" },
	},
	null,
	2,
);

type OutputTab = "raw" | "formatted" | "tree" | "table" | "graph";

const TABS: Array<{ value: OutputTab; label: string }> = [
	{ value: "raw", label: "Raw" },
	{ value: "formatted", label: "Formatted" },
	{ value: "tree", label: "Tree" },
	{ value: "table", label: "Table" },
	{ value: "graph", label: "Graph" },
];

export function JsonVisualizer() {
	const [input, setInput] = useState(DEFAULT_INPUT);
	const [debouncedInput, setDebouncedInput] = useState(DEFAULT_INPUT);
	const [activeTab, setActiveTab] = useState<OutputTab>("graph");
	const [transientError, setTransientError] = useState<string | null>(null);
	const [selectedNode, setSelectedNode] = useState<JsonTreeNode | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedInput(input), DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [input]);

	// Accepts a hand-off from the JSONDeveloper Chrome extension (see extension/src/content/editor-bridge.js)
	// — a no-op for everyone else, since nothing sends this message without the extension installed.
	// The listener is registered FIRST, then a request is posted asking the extension for any
	// pending transfer — the extension never delivers unprompted, specifically so it can't post
	// before this listener exists and silently lose the payload.
	useEffect(() => {
		function handleMessage(event: MessageEvent) {
			const result = parseExtensionLoadJsonMessage(event, window, window.location.origin);
			if (result) setInput(result.json);
		}
		window.addEventListener("message", handleMessage);
		window.postMessage(buildTransferRequestMessage(), window.location.origin);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	const tooLarge = useMemo(() => new TextEncoder().encode(debouncedInput).byteLength > MAX_INPUT_BYTES, [debouncedInput]);
	const result = useMemo(() => (tooLarge ? null : validateAndAnalyze(debouncedInput)), [debouncedInput, tooLarge]);

	const tree = useMemo(() => (result?.valid && result.value !== undefined ? buildJsonTree(result.value) : null), [result]);

	const formattedOutput = useMemo(() => {
		if (!result?.valid) return "";
		const formatted = formatJson(debouncedInput);
		return formatted.success && formatted.data ? formatted.data : debouncedInput;
	}, [result, debouncedInput]);

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

	return (
		<div className="space-y-4">
			<VisualizerPrivacyNotice />

			<VisualizerInputPanel value={input} onChange={setInput} markers={markers} onError={setTransientError} />

			{transientError && <ToolAlert variant="error">{transientError}</ToolAlert>}

			{tooLarge && (
				<ToolAlert variant="warning" title="Input too large">
					This document is larger than {Math.round(MAX_INPUT_BYTES / (1024 * 1024))}MB. Reduce its size to visualize it in the browser.
				</ToolAlert>
			)}

			{!tooLarge && result && !result.valid && result.error && (
				<ToolAlert variant="error" title="Invalid JSON">
					Line {result.error.line}, column {result.error.column}: {result.error.friendlyMessage}
				</ToolAlert>
			)}

			{!tooLarge && !debouncedInput.trim() && (
				<div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
					<p className="text-sm font-medium text-foreground">Nothing to visualize yet</p>
					<p className="mt-1 text-sm text-muted-foreground">Paste JSON above, upload a file, or load a sample to get started.</p>
				</div>
			)}

			{!tooLarge && result?.valid && result.value !== undefined && tree && (
				<div>
					<TabList items={TABS} value={activeTab} onChange={value => setActiveTab(value as OutputTab)} aria-label="Visualization view" />

					<div className="pt-4">
						<TabPanel value="raw" activeValue={activeTab}>
							<CodeEditor value={debouncedInput} onChange={() => {}} readOnly optimizeForReadOnly height="480px" />
						</TabPanel>

						<TabPanel value="formatted" activeValue={activeTab}>
							<CodeEditor value={formattedOutput} onChange={() => {}} readOnly optimizeForReadOnly height="480px" />
						</TabPanel>

						<TabPanel value="tree" activeValue={activeTab}>
							<div className="space-y-2">
								<div className="relative">
									<input
										type="search"
										value={searchQuery}
										onChange={event => setSearchQuery(event.target.value)}
										placeholder="Search keys or values…"
										className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									/>
								</div>
								<JsonTree root={tree.root} truncated={tree.truncated} selectedPath={selectedNode?.path ?? null} onSelect={setSelectedNode} searchQuery={searchQuery} />
							</div>
						</TabPanel>

						<TabPanel value="table" activeValue={activeTab}>
							<TableView value={result.value} />
						</TabPanel>

						<TabPanel value="graph" activeValue={activeTab}>
							<GraphView root={tree.root} value={result.value} />
						</TabPanel>
					</div>
				</div>
			)}
		</div>
	);
}
