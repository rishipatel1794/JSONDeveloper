"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { formatJson } from "@/lib/tools/json/formatter";
import { validateAgainstSchema } from "@/lib/tools/json-validator/schema-validator";
import type { JsonValue } from "@/lib/tools/json-validator/types";

interface SchemaValidatorProps {
	jsonValue: JsonValue | undefined;
	jsonValid: boolean;
}

export function SchemaValidator({ jsonValue, jsonValid }: SchemaValidatorProps) {
	const [schemaText, setSchemaText] = useState("");

	const schemaParse = useMemo((): { success: true; value: JsonValue } | { success: false; error?: string } => {
		if (!schemaText.trim()) return { success: false, error: undefined };
		try {
			return { success: true, value: JSON.parse(schemaText) as JsonValue };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : "Invalid JSON Schema." };
		}
	}, [schemaText]);

	const result = useMemo(() => {
		if (!jsonValid || jsonValue === undefined || !schemaParse.success) return null;
		return validateAgainstSchema(jsonValue, schemaParse.value);
	}, [jsonValid, jsonValue, schemaParse]);

	function handleFormatSchema() {
		const formatted = formatJson(schemaText);
		if (formatted.success && formatted.data) setSchemaText(formatted.data);
	}

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
					<div className="flex items-center gap-2 text-sm font-medium">
						<ShieldCheck className="size-4 text-muted-foreground" />
						JSON Schema
					</div>
				</div>

				<CodeEditor value={schemaText} onChange={setSchemaText} height="320px" placeholder="Paste a JSON Schema document here…" />

				<div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
					<Button onClick={handleFormatSchema} variant="outline" size="sm" disabled={!schemaText.trim()}>
						Format Schema
					</Button>
					<Button
						onClick={() => setSchemaText("")}
						variant="ghost"
						size="sm"
						disabled={!schemaText.trim()}
						className="ml-auto text-destructive hover:bg-destructive-muted"
					>
						Clear
					</Button>
				</div>
			</div>

			{!jsonValid && <ToolAlert variant="info">Fix the JSON input above before validating it against a schema.</ToolAlert>}

			{jsonValid && schemaText.trim() && !schemaParse.success && (
				<ToolAlert variant="error" title="Invalid JSON Schema">
					{schemaParse.error ?? "This schema is not valid JSON."}
				</ToolAlert>
			)}

			{result && (
				<ToolPanel title="Schema Validation Result" icon={ShieldCheck}>
					{result.error ? (
						<div className="px-4 py-3">
							<ToolAlert variant="error">{result.error}</ToolAlert>
						</div>
					) : result.valid ? (
						<div className="px-4 py-3">
							<ToolAlert variant="success" title="JSON matches schema">
								Every value in the JSON input satisfies the schema.
							</ToolAlert>
						</div>
					) : (
						<div className="divide-y divide-border-subtle">
							<div className="px-4 py-2.5">
								<p className="text-sm font-medium text-destructive">
									{result.issues.length} validation error{result.issues.length === 1 ? "" : "s"}
								</p>
							</div>
							{result.issues.map((issue, index) => (
								<div key={`${issue.path}-${index}`} className="px-4 py-2.5">
									<p className="font-mono text-sm font-medium text-foreground">{issue.path || "(root)"}</p>
									<p className="mt-0.5 text-sm text-muted-foreground">{issue.message}</p>
									{issue.expected && issue.received && (
										<p className="mt-0.5 text-xs text-muted-foreground">
											Expected: <span className="font-mono text-foreground">{issue.expected}</span> · Received:{" "}
											<span className="font-mono text-foreground">{issue.received}</span>
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</ToolPanel>
			)}
		</div>
	);
}
