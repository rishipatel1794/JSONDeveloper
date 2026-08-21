"use client";

import { useMemo } from "react";
import { Code2 } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { Button } from "@/components/ui/Button";
import { TabList, TabPanel } from "@/components/ui/Tabs";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { generateJsonSchemaText } from "@/lib/tools/json-validator/schema-generator";
import type { JsonValue } from "@/lib/tools/json-validator/types";
import { generateTypeScript } from "@/lib/tools/json-validator/typescript-generator";
import { generateZod } from "@/lib/tools/json-validator/zod-generator";

export type GeneratedOutputTab = "typescript" | "zod" | "jsonschema";

const TAB_ITEMS: { value: GeneratedOutputTab; label: string }[] = [
	{ value: "typescript", label: "TypeScript" },
	{ value: "zod", label: "Zod" },
	{ value: "jsonschema", label: "JSON Schema" },
];

const FILE_INFO: Record<GeneratedOutputTab, { filename: string; language: string; mimeType: string }> = {
	typescript: { filename: "types.ts", language: "typescript", mimeType: "text/typescript" },
	zod: { filename: "schema.ts", language: "typescript", mimeType: "text/typescript" },
	jsonschema: { filename: "schema.json", language: "json", mimeType: "application/json" },
};

interface GeneratedOutputProps {
	value: JsonValue;
	activeTab: GeneratedOutputTab | null;
	onTabChange: (tab: GeneratedOutputTab) => void;
}

/** Generates output only for the currently-selected tab — never all three eagerly. */
export function GeneratedOutput({ value, activeTab, onTabChange }: GeneratedOutputProps) {
	const output = useMemo(() => {
		if (!activeTab) return "";
		switch (activeTab) {
			case "typescript":
				return generateTypeScript(value);
			case "zod":
				return generateZod(value);
			case "jsonschema":
				return generateJsonSchemaText(value);
		}
	}, [activeTab, value]);

	const fileInfo = activeTab ? FILE_INFO[activeTab] : null;

	return (
		<ToolPanel title="Generated Output" icon={Code2} action={activeTab && <CopyButton value={output} ariaLabel="Copy generated output" />}>
			<div className="px-4 pt-3">
				<TabList aria-label="Generated output format" value={activeTab ?? ""} onChange={next => onTabChange(next as GeneratedOutputTab)} items={TAB_ITEMS} />
			</div>

			{!activeTab ? (
				<p className="px-4 py-6 text-sm text-muted-foreground">Choose a format above (or a Quick Action) to generate it.</p>
			) : (
				<>
					{TAB_ITEMS.map(tab => (
						<TabPanel key={tab.value} value={tab.value} activeValue={activeTab}>
							<div className="overflow-hidden border-t border-border-subtle">
								<CodeEditor value={output} onChange={() => {}} language={FILE_INFO[tab.value].language} height="320px" readOnly />
							</div>
						</TabPanel>
					))}

					<div className="flex justify-end border-t border-border-subtle px-4 py-2.5">
						<Button
							onClick={() => fileInfo && downloadTextFile(output, fileInfo.filename, fileInfo.mimeType)}
							variant="ghost"
							size="sm"
						>
							Download {fileInfo?.filename}
						</Button>
					</div>
				</>
			)}
		</ToolPanel>
	);
}
