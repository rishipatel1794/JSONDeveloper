import { Braces } from "lucide-react";

import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";

interface JwtGeneratorHeaderPanelProps {
	value: string;
	onChange: (value: string) => void;
	error: string | null;
}

export function JwtGeneratorHeaderPanel({ value, onChange, error }: JwtGeneratorHeaderPanelProps) {
	return (
		<ToolPanel title="Header" icon={Braces}>
			<CodeEditor value={value} onChange={onChange} height="180px" />
			{error && <p className="border-t border-destructive-border bg-destructive-muted px-3 py-2 text-xs text-destructive-muted-foreground">{error}</p>}
		</ToolPanel>
	);
}
