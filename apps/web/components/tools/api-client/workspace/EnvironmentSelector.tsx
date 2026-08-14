import type { Environment } from "@/lib/api-client/workspace/types";

interface EnvironmentSelectorProps {
	environments: Environment[];
	activeEnvironmentId: string | null;
	onChange: (id: string | null) => void;
}

export function EnvironmentSelector({ environments, activeEnvironmentId, onChange }: EnvironmentSelectorProps) {
	return (
		<label className="inline-flex items-center gap-2">
			<span className="text-xs font-medium text-muted-foreground">Environment</span>
			<select
				value={activeEnvironmentId ?? ""}
				onChange={event => onChange(event.target.value || null)}
				className="h-9 rounded-md border border-border bg-card px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<option value="">No Environment</option>
				{environments.map(environment => (
					<option key={environment.id} value={environment.id}>
						{environment.name}
					</option>
				))}
			</select>
		</label>
	);
}
