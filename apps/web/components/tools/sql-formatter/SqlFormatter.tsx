"use client";

import { useEffect, useRef, useState } from "react";
import { FileCode2 } from "lucide-react";

import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { formatSql, minifySql } from "@/lib/tools/sql/formatter";
import type { KeywordCase, SqlDialect } from "@/lib/tools/sql/types";
import { SQL_EXAMPLES } from "@/lib/tools/sql/utils";

import { SqlDialectSelector } from "./SqlDialectSelector";
import { SqlError } from "./SqlError";
import { SqlFormattingOptions } from "./SqlFormattingOptions";
import { SqlResult } from "./SqlResult";
import { SqlToolbar } from "./SqlToolbar";

const DEFAULT_DIALECT: SqlDialect = "postgresql";
const DEFAULT_KEYWORD_CASE: KeywordCase = "upper";
const DEFAULT_TAB_WIDTH = 2;

export function SqlFormatter() {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [dialect, setDialect] = useState<SqlDialect>(DEFAULT_DIALECT);
	const [keywordCase, setKeywordCase] = useState<KeywordCase>(DEFAULT_KEYWORD_CASE);
	const [tabWidth, setTabWidth] = useState(DEFAULT_TAB_WIDTH);
	const [error, setError] = useState("");
	const [status, setStatus] = useState("");

	function handleFormat() {
		const result = formatSql(input, { dialect, keywordCase, tabWidth });

		if (!result.success) {
			setError(result.error ?? "Unable to format SQL.");
			setStatus("");
			return;
		}

		setOutput(result.data ?? "");
		setError("");
		setStatus("SQL formatted successfully");
	}

	function handleMinify() {
		const result = minifySql(input);

		if (!result.success) {
			setError(result.error ?? "Unable to minify SQL.");
			setStatus("");
			return;
		}

		setOutput(result.data ?? "");
		setError("");
		setStatus("SQL minified successfully");
	}

	function handleClear() {
		setInput("");
		setOutput("");
		setError("");
		setStatus("");
		setDialect(DEFAULT_DIALECT);
		setKeywordCase(DEFAULT_KEYWORD_CASE);
		setTabWidth(DEFAULT_TAB_WIDTH);
	}

	function handleDownload() {
		if (!output) return;

		downloadTextFile(output, "formatted.sql", "application/sql");
		setStatus("SQL downloaded");
	}

	function handleLoadExample(index: number) {
		const example = SQL_EXAMPLES[index];
		if (!example) return;

		setInput(example.sql);
		setDialect(example.dialect);

		const result = formatSql(example.sql, { dialect: example.dialect, keywordCase, tabWidth });
		if (result.success) {
			setOutput(result.data ?? "");
			setError("");
			setStatus("SQL formatted successfully");
		}
	}

	// Monaco manages its own keybindings internally, so a local onKeyDown on the editor container
	// isn't reliable for Ctrl/Cmd+Enter — a document-level listener works regardless of focus.
	const handleFormatRef = useRef(handleFormat);
	handleFormatRef.current = handleFormat;

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
				event.preventDefault();
				handleFormatRef.current();
			}
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<div className="space-y-4">
			<div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
				<SqlDialectSelector value={dialect} onChange={setDialect} />

				<SqlFormattingOptions
					keywordCase={keywordCase}
					onKeywordCaseChange={setKeywordCase}
					tabWidth={tabWidth}
					onTabWidthChange={setTabWidth}
				/>

				<SqlToolbar
					hasInput={Boolean(input.trim())}
					output={output}
					onFormat={handleFormat}
					onMinify={handleMinify}
					onDownload={handleDownload}
					onClear={handleClear}
					onLoadExample={handleLoadExample}
				/>
			</div>

			{error && <SqlError message={error} />}
			{status && !error && <ToolAlert variant="success">{status}</ToolAlert>}

			<div className="grid gap-4 lg:grid-cols-2">
				<ToolPanel title="SQL Input" icon={FileCode2}>
					<CodeEditor value={input} onChange={setInput} language="sql" placeholder="Paste your SQL query here..." />
				</ToolPanel>

				<SqlResult value={output} />
			</div>
		</div>
	);
}
