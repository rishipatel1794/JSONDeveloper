import { SQL_EXAMPLES } from "@/lib/tools/sql/utils";

interface SqlExamplesProps {
	onSelect: (index: number) => void;
}

export function SqlExamples({ onSelect }: SqlExamplesProps) {
	return (
		<label className="inline-flex items-center">
			<span className="sr-only">Load an example query</span>
			<select
				defaultValue=""
				onChange={event => {
					const index = Number(event.target.value);
					if (!Number.isNaN(index)) onSelect(index);
					event.target.value = "";
				}}
				className="h-10 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<option value="" disabled>
					Examples
				</option>
				{SQL_EXAMPLES.map((example, index) => (
					<option key={example.name} value={index}>
						{example.name}
					</option>
				))}
			</select>
		</label>
	);
}
