import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/Button";

interface JwtInputProps {
	value: string;
	onChange: (value: string) => void;
	onDecode: () => void;
	onClear: () => void;
	onLoadExample: () => void;
}

export function JwtInput({ value, onChange, onDecode, onClear, onLoadExample }: JwtInputProps) {
	function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
			event.preventDefault();
			onDecode();
		}
	}

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
			<div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2.5">
				<span className="text-sm font-medium">JWT Input</span>
				<span className="hidden text-xs text-muted-foreground sm:inline">Ctrl / ⌘ + Enter to decode</span>
			</div>

			<div className="p-4">
				<label htmlFor="jwt-input" className="sr-only">
					JWT input
				</label>
				<textarea
					id="jwt-input"
					value={value}
					onChange={event => onChange(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Paste your JWT here..."
					spellCheck={false}
					autoComplete="off"
					autoCorrect="off"
					rows={6}
					className="w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>

				<div className="mt-3 flex flex-wrap items-center gap-2">
					<Button onClick={onDecode} variant="primary" size="md">
						Decode JWT
					</Button>
					<Button onClick={onLoadExample} variant="outline" size="md">
						Load Example
					</Button>
					<Button onClick={onClear} variant="ghost" size="md" className="ml-auto text-destructive hover:bg-destructive-muted">
						Clear
					</Button>
				</div>
			</div>
		</div>
	);
}
