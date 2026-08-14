interface UrlInputProps {
	value: string;
	onChange: (value: string) => void;
}

export function UrlInput({ value, onChange }: UrlInputProps) {
	return (
		<label className="flex min-w-0 flex-1 items-center">
			<span className="sr-only">Request URL</span>
			<input
				type="text"
				value={value}
				onChange={event => onChange(event.target.value)}
				placeholder="https://api.example.com/endpoint"
				spellCheck={false}
				autoComplete="off"
				autoCorrect="off"
				className="h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			/>
		</label>
	);
}
