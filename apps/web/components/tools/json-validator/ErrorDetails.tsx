import type { ContextLine, JsonSyntaxError } from "@/lib/tools/json-validator/types";
import { cn } from "@/lib/utils";

interface ErrorDetailsProps {
	error: JsonSyntaxError;
	contextLines?: ContextLine[];
}

export function ErrorDetails({ error, contextLines }: ErrorDetailsProps) {
	return (
		<div className="space-y-3">
			<div>
				<p className="font-medium text-foreground">{error.friendlyMessage}</p>
				{error.friendlyMessage !== error.message && <p className="mt-0.5 font-mono text-xs text-muted-foreground">{error.message}</p>}
			</div>

			<div className="flex gap-4 text-xs text-muted-foreground">
				<span>
					Line <span className="font-mono font-medium text-foreground">{error.line}</span>
				</span>
				<span>
					Column <span className="font-mono font-medium text-foreground">{error.column}</span>
				</span>
			</div>

			{contextLines && contextLines.length > 0 && (
				<div className="overflow-x-auto rounded-md border border-border bg-background font-mono text-xs">
					{contextLines.map(line => (
						<div key={line.lineNumber} className={cn("flex gap-3 px-3 py-1", line.isErrorLine && "bg-destructive-muted")}>
							<span className={cn("w-8 shrink-0 select-none text-right text-subtle-foreground", line.isErrorLine && "text-destructive-muted-foreground")}>
								{line.lineNumber}
							</span>
							<span className={cn("whitespace-pre", line.isErrorLine ? "text-destructive-muted-foreground" : "text-foreground")}>
								{line.text || " "}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
