import type { KeyboardEvent } from "react";

interface RegexInputProps {
	pattern: string;
	onChange: (value: string) => void;
	onTest: () => void;
}

export function RegexInput({ pattern, onChange, onTest }: RegexInputProps) {
	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
			event.preventDefault();
			onTest();
		}
	}

	return (
		<div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm focus-within:ring-2 focus-within:ring-ring">
			<span className="text-muted-foreground" aria-hidden="true">
				/
			</span>

			<label htmlFor="regex-pattern" className="sr-only">
				Regular expression pattern
			</label>
			<input
				id="regex-pattern"
				type="text"
				value={pattern}
				onChange={event => onChange(event.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Enter a regular expression..."
				spellCheck={false}
				autoComplete="off"
				autoCorrect="off"
				className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
			/>

			<span className="text-muted-foreground" aria-hidden="true">
				/
			</span>
		</div>
	);
}
