import { FileCode2 } from "lucide-react";

import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { CopyButton } from "@/components/ui/CopyButton";

interface SqlResultProps {
	value: string;
}

export function SqlResult({ value }: SqlResultProps) {
	return (
		<ToolPanel title="Formatted SQL" icon={FileCode2} action={<CopyButton value={value} label="Copy" disabled={!value} />}>
			<CodeEditor
				value={value}
				onChange={() => {}}
				readOnly
				language="sql"
				placeholder="Formatted SQL will appear here"
			/>
		</ToolPanel>
	);
}
