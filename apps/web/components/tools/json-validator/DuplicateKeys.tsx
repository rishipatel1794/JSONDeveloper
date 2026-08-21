import { AlertTriangle } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { formatDuplicateKeyPath } from "@/lib/tools/json-validator/duplicate-keys";
import type { DuplicateKeyOccurrence } from "@/lib/tools/json-validator/types";

interface DuplicateKeysProps {
	duplicates: DuplicateKeyOccurrence[];
	onJumpToLine: (line: number) => void;
}

export function DuplicateKeys({ duplicates, onJumpToLine }: DuplicateKeysProps) {
	if (duplicates.length === 0) return null;

	return (
		<ToolPanel title={`${duplicates.length} Duplicate Key${duplicates.length === 1 ? "" : "s"} Found`} icon={AlertTriangle}>
			<div className="divide-y divide-border-subtle">
				{duplicates.map(duplicate => (
					<div key={`${duplicate.path}::${duplicate.key}`} className="px-4 py-2.5">
						<p className="font-mono text-sm font-medium text-warning">{formatDuplicateKeyPath(duplicate)}</p>
						<div className="mt-1 flex flex-wrap gap-1.5">
							{duplicate.locations.map(location => (
								<button
									key={location.line}
									type="button"
									onClick={() => onJumpToLine(location.line)}
									className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary-accent"
								>
									Line {location.line}
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</ToolPanel>
	);
}
