import { History, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { TimestampHistoryEntry } from "@/lib/tools/timestamp/history";

interface TimestampHistoryProps {
	entries: TimestampHistoryEntry[];
	onLoad: (entry: TimestampHistoryEntry) => void;
	onDelete: (id: string) => void;
	onClear: () => void;
}

export function TimestampHistory({ entries, onLoad, onDelete, onClear }: TimestampHistoryProps) {
	if (entries.length === 0) return null;

	return (
		<ToolPanel
			title="Recent"
			icon={History}
			action={
				<Button onClick={onClear} variant="ghost" size="sm">
					Clear
				</Button>
			}
		>
			<div className="divide-y divide-border-subtle">
				{entries.map(entry => (
					<div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-2">
						<button
							type="button"
							onClick={() => onLoad(entry)}
							className="min-w-0 flex-1 truncate rounded-md py-0.5 text-left font-mono text-sm text-foreground hover:text-primary-accent"
						>
							{entry.input}
						</button>
						<button
							type="button"
							onClick={() => onDelete(entry.id)}
							aria-label={`Remove ${entry.input} from recent history`}
							className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
						>
							<Trash2 className="size-3.5" />
						</button>
					</div>
				))}
			</div>
		</ToolPanel>
	);
}
