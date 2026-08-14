import type { ImportedServer, ImportedVariableSuggestion } from "@/lib/api-client/import/types";

interface OpenApiImportOptionsProps {
	servers: ImportedServer[];
	selectedServerIndex: number;
	onServerChange: (index: number) => void;
	generateBodies: boolean;
	onGenerateBodiesChange: (value: boolean) => void;
	suggestedVariables: ImportedVariableSuggestion[];
	selectedVariableNames: Set<string>;
	onVariableSelectionChange: (names: Set<string>) => void;
}

export function OpenApiImportOptions({
	servers,
	selectedServerIndex,
	onServerChange,
	generateBodies,
	onGenerateBodiesChange,
	suggestedVariables,
	selectedVariableNames,
	onVariableSelectionChange,
}: OpenApiImportOptionsProps) {
	function toggleVariable(name: string) {
		const next = new Set(selectedVariableNames);
		if (next.has(name)) next.delete(name);
		else next.add(name);
		onVariableSelectionChange(next);
	}

	return (
		<div className="space-y-4">
			{servers.length > 1 && (
				<div>
					<p className="mb-1.5 text-sm font-medium text-foreground">Select API Server</p>
					<div className="space-y-1.5" role="radiogroup" aria-label="API server">
						{servers.map((server, index) => (
							<label key={`${server.url}-${index}`} className="flex items-start gap-2 rounded-md border border-border bg-card p-2.5 text-sm">
								<input
									type="radio"
									checked={selectedServerIndex === index}
									onChange={() => onServerChange(index)}
									className="mt-0.5 size-4 accent-primary"
								/>
								<span>
									<span className="block font-medium text-foreground">{server.label}</span>
									<span className="block font-mono text-xs text-muted-foreground">{server.url}</span>
								</span>
							</label>
						))}
					</div>
				</div>
			)}

			<div>
				<p className="mb-1.5 text-sm font-medium text-foreground">Import Options</p>
				<label className="flex items-center gap-2 text-sm text-muted-foreground">
					<input
						type="checkbox"
						checked={generateBodies}
						onChange={event => onGenerateBodiesChange(event.target.checked)}
						className="size-4 rounded border-border accent-primary"
					/>
					Generate example request bodies
				</label>
			</div>

			{suggestedVariables.length > 0 && (
				<div>
					<p className="mb-1.5 text-sm font-medium text-foreground">Generate Variables</p>
					<div className="space-y-1.5">
						{suggestedVariables.map(variable => (
							<label key={variable.name} className="flex items-center gap-2 text-sm text-muted-foreground">
								<input
									type="checkbox"
									checked={selectedVariableNames.has(variable.name)}
									onChange={() => toggleVariable(variable.name)}
									className="size-4 rounded border-border accent-primary"
								/>
								<span className="font-mono text-foreground">{variable.name}</span>
								{variable.secret && <span className="text-xs text-subtle-foreground">(secret)</span>}
							</label>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
