"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { TabList, TabPanel } from "@/components/ui/Tabs";
import type { EditorMarker } from "@/components/tools/shared/CodeEditor";
import { setPendingApiRequest } from "@/lib/api-client/pending-request";
import { downloadTextFile } from "@/lib/download";
import { formatJson, minifyJson } from "@/lib/tools/json/formatter";
import { buildJsonTree } from "@/lib/tools/json-validator/json-path";
import { detectSmartValues } from "@/lib/tools/json-validator/smart-detectors";
import type { JsonTreeNode } from "@/lib/tools/json-validator/types";
import { computeUtf8ByteLength } from "@/lib/tools/json-validator/utils";
import { validateAndAnalyze } from "@/lib/tools/json-validator/validator";

import { DuplicateKeys } from "./DuplicateKeys";
import { GeneratedOutput, type GeneratedOutputTab } from "./GeneratedOutput";
import { JsonEditorPanel } from "./JsonEditorPanel";
import { JsonPathViewer } from "./JsonPathViewer";
import { JsonStatistics } from "./JsonStatistics";
import { JsonTree } from "./JsonTree";
import { JsonValidatorPrivacyNotice } from "./JsonValidatorPrivacyNotice";
import { QuickActionsBar } from "./QuickActionsBar";
import { SchemaValidator } from "./SchemaValidator";
import { SmartActions } from "./SmartActions";
import { ValidationResult } from "./ValidationResult";

const DEBOUNCE_MS = 350;

const DEFAULT_JSON = `{
  "id": 1,
  "name": "Rishi",
  "active": true
}`;

type Mode = "validator" | "schema";

export function JsonValidator() {
	const [input, setInput] = useState(DEFAULT_JSON);
	const [debouncedInput, setDebouncedInput] = useState(DEFAULT_JSON);
	const [mode, setMode] = useState<Mode>("validator");
	const [selectedNode, setSelectedNode] = useState<JsonTreeNode | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [outputTab, setOutputTab] = useState<GeneratedOutputTab | null>(null);
	const [revealLine, setRevealLine] = useState<number | undefined>(undefined);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedInput(input), DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [input]);

	const result = useMemo(() => validateAndAnalyze(debouncedInput), [debouncedInput]);

	const tree = useMemo(() => (result.valid && result.value !== undefined ? buildJsonTree(result.value) : null), [result]);
	const smartDetections = useMemo(() => (result.valid && result.value !== undefined ? detectSmartValues(result.value) : []), [result]);

	const formattedForSize = useMemo(() => {
		if (!result.valid) return "";
		const formatted = formatJson(debouncedInput);
		return formatted.success && formatted.data ? formatted.data : debouncedInput;
	}, [result.valid, debouncedInput]);

	const markers: EditorMarker[] = useMemo(() => {
		const list: EditorMarker[] = [];

		if (!result.valid && result.error) {
			const column = Math.max(1, result.error.column);
			list.push({
				startLineNumber: result.error.line,
				startColumn: column,
				endLineNumber: result.error.line,
				endColumn: column + 1,
				message: result.error.friendlyMessage,
				severity: "error",
			});
		}

		for (const duplicate of result.duplicates) {
			for (const location of duplicate.locations) {
				list.push({
					startLineNumber: location.line,
					startColumn: location.column,
					endLineNumber: location.line,
					endColumn: location.column + duplicate.key.length + 2,
					message: `Duplicate key "${duplicate.key}"`,
					severity: "warning",
				});
			}
		}

		return list;
	}, [result]);

	function handleValidateNow() {
		setDebouncedInput(input);
	}

	function handleFormat() {
		const formatted = formatJson(input);
		if (formatted.success && formatted.data) {
			setInput(formatted.data);
			setDebouncedInput(formatted.data);
		}
	}

	function handleMinify() {
		const minified = minifyJson(input);
		if (minified.success && minified.data) {
			setInput(minified.data);
			setDebouncedInput(minified.data);
		}
	}

	function handleClear() {
		setInput("");
		setDebouncedInput("");
		setSelectedNode(null);
		setOutputTab(null);
		setSearchQuery("");
	}

	function handleSendToApiClient() {
		if (!result.valid) return;
		setPendingApiRequest({ body: debouncedInput, bodyType: "json" });
		window.open("/api-client", "_blank");
	}

	async function handleCopyJson() {
		if (result.valid) await navigator.clipboard.writeText(debouncedInput);
	}

	function handleDownloadJson() {
		if (result.valid) downloadTextFile(debouncedInput, "validated.json", "application/json");
	}

	return (
		<div className="space-y-6">
			<JsonValidatorPrivacyNotice />

			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<TabList
					aria-label="JSON tool mode"
					value={mode}
					onChange={next => setMode(next as Mode)}
					items={[
						{ value: "validator", label: "JSON Validator" },
						{ value: "schema", label: "JSON Schema" },
					]}
				/>

				<div className="pt-4">
					<TabPanel value="validator" activeValue={mode}>
						<div className="grid gap-4 lg:grid-cols-2">
							<JsonEditorPanel
								value={input}
								onChange={setInput}
								onValidateNow={handleValidateNow}
								onFormat={handleFormat}
								onMinify={handleMinify}
								onClear={handleClear}
								onSendToApiClient={result.valid ? handleSendToApiClient : undefined}
								markers={markers}
								revealLine={revealLine}
								sizeBytes={computeUtf8ByteLength(input)}
							/>

							<div className="space-y-4">
								<ValidationResult result={result} />
								{result.valid && result.statistics && <JsonStatistics statistics={result.statistics} formattedOutput={formattedForSize} />}
								{result.duplicates.length > 0 && <DuplicateKeys duplicates={result.duplicates} onJumpToLine={setRevealLine} />}
							</div>
						</div>
					</TabPanel>

					<TabPanel value="schema" activeValue={mode}>
						<SchemaValidator jsonValue={result.valid ? result.value : undefined} jsonValid={result.valid} />
					</TabPanel>
				</div>
			</div>

			{mode === "validator" && result.valid && result.value !== undefined && (
				<>
					<QuickActionsBar disabled={!result.valid} onGenerate={setOutputTab} onCopy={handleCopyJson} onDownload={handleDownloadJson} />

					<SmartActions detections={smartDetections} />

					<GeneratedOutput value={result.value} activeTab={outputTab} onTabChange={setOutputTab} />

					{tree && (
						<div className="grid gap-4 lg:grid-cols-2">
							<div className="space-y-2">
								<label htmlFor="json-tree-search" className="block text-sm font-medium text-foreground">
									Search JSON
								</label>
								<div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
									<Search className="size-4 shrink-0 text-muted-foreground" />
									<input
										id="json-tree-search"
										type="text"
										value={searchQuery}
										onChange={event => setSearchQuery(event.target.value)}
										placeholder="Search JSON..."
										className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
									/>
								</div>
								<JsonTree
									root={tree.root}
									truncated={tree.truncated}
									selectedPath={selectedNode?.path ?? null}
									onSelect={setSelectedNode}
									searchQuery={searchQuery}
								/>
							</div>

							<JsonPathViewer node={selectedNode} />
						</div>
					)}
				</>
			)}
		</div>
	);
}
