interface OpenApiImportSummaryProps {
	collectionName: string;
	requestCount: number;
	folderCount: number;
	environmentName: string;
	variableNames: string[];
}

export function OpenApiImportSummary({ collectionName, requestCount, folderCount, environmentName, variableNames }: OpenApiImportSummaryProps) {
	const rows: [string, string][] = [
		["Collection", collectionName],
		["Requests", String(requestCount)],
		["Folders", String(folderCount)],
		["Environment", environmentName],
	];

	return (
		<div className="space-y-3">
			<div className="divide-y divide-border-subtle rounded-md border border-border">
				{rows.map(([label, value]) => (
					<div key={label} className="flex items-center justify-between px-3 py-2 text-sm">
						<span className="text-muted-foreground">{label}</span>
						<span className="font-medium text-foreground">{value}</span>
					</div>
				))}
			</div>

			{variableNames.length > 0 && (
				<div>
					<p className="mb-1 text-xs font-medium text-muted-foreground">Variables</p>
					<div className="flex flex-wrap gap-1.5">
						{variableNames.map(name => (
							<span key={name} className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground">
								{name}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
