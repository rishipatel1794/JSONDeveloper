import { EXPLAINER_EXAMPLES, type ExplainerExample } from "@/lib/tools/regex-explainer/examples";

interface ExampleLibraryProps {
	onSelect: (example: ExplainerExample) => void;
}

export function ExampleLibrary({ onSelect }: ExampleLibraryProps) {
	return (
		<div>
			<p className="mb-2 text-sm font-medium">Example patterns</p>
			<div className="flex flex-wrap gap-2">
				{EXPLAINER_EXAMPLES.map(example => (
					<button
						key={example.id}
						type="button"
						onClick={() => onSelect(example)}
						title={example.note}
						className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground"
					>
						{example.label}
					</button>
				))}
			</div>
		</div>
	);
}
