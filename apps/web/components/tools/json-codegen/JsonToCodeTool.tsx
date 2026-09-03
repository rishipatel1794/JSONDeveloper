"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Code2, FileJson2, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { downloadTextFile } from "@/lib/download";
import type { JsonValue } from "@/lib/tools/json-validator/types";
import { generateTypeScript } from "@/lib/tools/json-validator/typescript-generator";
import { generateZod } from "@/lib/tools/json-validator/zod-generator";
import { generatePython } from "@/lib/tools/json-to-python/generator";
import { generatePhp } from "@/lib/tools/json-to-php/generator";
import { generateJava } from "@/lib/tools/json-to-java/generator";

export type CodegenTarget = "typescript" | "zod" | "python" | "php" | "java";

/**
 * Config lives here (in the client component) rather than being passed in from each server page —
 * a function prop can't cross the server/client boundary in the App Router, since it isn't serializable.
 */
const TARGETS: Record<CodegenTarget, { generate: (value: JsonValue, rootName: string) => string; monacoLanguage: string; fileExtension: string; mimeType: string }> = {
	typescript: { generate: generateTypeScript, monacoLanguage: "typescript", fileExtension: "ts", mimeType: "text/typescript" },
	zod: { generate: generateZod, monacoLanguage: "typescript", fileExtension: "ts", mimeType: "text/typescript" },
	python: { generate: generatePython, monacoLanguage: "python", fileExtension: "py", mimeType: "text/x-python" },
	php: { generate: generatePhp, monacoLanguage: "php", fileExtension: "php", mimeType: "application/x-httpd-php" },
	java: { generate: generateJava, monacoLanguage: "java", fileExtension: "java", mimeType: "text/x-java-source" },
};

interface JsonToCodeToolProps {
	target: CodegenTarget;
	rootNameLabel: string;
	exampleJson: string;
	exampleRootName?: string;
}

export function JsonToCodeTool({ target, rootNameLabel, exampleJson, exampleRootName }: JsonToCodeToolProps) {
	const [input, setInput] = useState(exampleJson);
	const [rootName, setRootName] = useState(exampleRootName ?? "Root");
	const { generate, monacoLanguage, fileExtension, mimeType } = TARGETS[target];

	const { output, error } = useMemo(() => {
		if (!input.trim()) return { output: "", error: null };

		try {
			const parsed = JSON.parse(input) as JsonValue;
			return { output: generate(parsed, rootName.trim() || "Root"), error: null };
		} catch (caught) {
			return { output: "", error: caught instanceof Error ? caught.message : "Invalid JSON" };
		}
	}, [input, rootName, generate]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
				<label className="flex items-center gap-2 text-sm text-muted-foreground">
					{rootNameLabel}
					<input
						value={rootName}
						onChange={event => setRootName(event.target.value)}
						placeholder="Root"
						className="w-40 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</label>

				<div className="flex items-center gap-2">
					<Button onClick={() => setInput(exampleJson)} variant="ghost" size="sm">
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
					</div>

					<CodeEditor value={input} onChange={setInput} language="json" placeholder="Paste JSON here…" />
				</div>

				<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
					<div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2.5">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Code2 className="size-4 text-muted-foreground" />
							Generated Code
						</div>
						{output && (
							<div className="flex items-center gap-2">
								<CopyButton value={output} ariaLabel="Copy generated code" />
								<Button onClick={() => downloadTextFile(output, `${rootName.trim() || "Root"}.${fileExtension}`, mimeType)} variant="outline" size="sm">
									Download
								</Button>
							</div>
						)}
					</div>

					<CodeEditor value={output} onChange={() => {}} language={monacoLanguage} readOnly placeholder="Generated code will appear here" />
				</div>
			</div>
		</div>
	);
}
