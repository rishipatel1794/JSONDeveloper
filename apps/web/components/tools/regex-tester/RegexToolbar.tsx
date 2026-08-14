import { ToolToolbar } from "@/components/tools/shared/ToolToolbar";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

import { RegexExamples } from "./RegexExamples";

interface RegexToolbarProps {
	pattern: string;
	flags: string;
	onTest: () => void;
	onClear: () => void;
	onLoadExample: (index: number) => void;
}

export function RegexToolbar({ pattern, flags, onTest, onClear, onLoadExample }: RegexToolbarProps) {
	const hasPattern = pattern.trim().length > 0;

	return (
		<ToolToolbar>
			<Button onClick={onTest} disabled={!hasPattern}>
				Test Regex
			</Button>

			<RegexExamples onSelect={onLoadExample} />

			<CopyButton value={hasPattern ? `/${pattern}/${flags}` : ""} label="Copy Regex" disabled={!hasPattern} />

			<Button onClick={onClear} variant="ghost" className="ml-auto text-destructive hover:bg-destructive-muted">
				Clear
			</Button>
		</ToolToolbar>
	);
}
