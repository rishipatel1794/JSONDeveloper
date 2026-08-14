import type { KeyboardEvent } from "react";
import { FileText } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";

interface TestStringInputProps {
	value: string;
	onChange: (value: string) => void;
	onTest: () => void;
}

export function TestStringInput({ value, onChange, onTest }: TestStringInputProps) {
	function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
			event.preventDefault();
			onTest();
		}
	}

	return (
		<ToolPanel
			title="Test String"
			icon={FileText}
			action={<span className="text-xs font-normal text-muted-foreground">{value.length.toLocaleString()} chars</span>}
		>
			<div className="p-4">
				<label htmlFor="regex-test-string" className="sr-only">
					Test string
				</label>
				<textarea
					id="regex-test-string"
					value={value}
					onChange={event => onChange(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Enter text to test your regular expression..."
					spellCheck={false}
					rows={8}
					className="w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>
		</ToolPanel>
	);
}
