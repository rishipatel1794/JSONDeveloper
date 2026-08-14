import { CheckCircle2, Search } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { RegexMatch } from "@/lib/tools/regex/types";
import { buildHighlightSegments, MAX_HIGHLIGHT_MATCHES } from "@/lib/tools/regex/utils";
import { cn } from "@/lib/utils";

interface MatchResultProps {
	testString: string;
	matches: RegexMatch[];
	truncated?: boolean;
}

export function MatchResult({ testString, matches, truncated }: MatchResultProps) {
	const matchCount = matches.length;
	const hasMatches = matchCount > 0;

	return (
		<ToolPanel title="Results" icon={Search}>
			<div className="p-4">
				<p className={cn("flex items-center gap-2 text-sm font-medium", hasMatches ? "text-success" : "text-muted-foreground")}>
					{hasMatches && <CheckCircle2 className="size-4" />}
					{hasMatches
						? `${matchCount.toLocaleString()}${truncated ? "+" : ""} match${matchCount === 1 ? "" : "es"} found`
						: "No matches found"}
				</p>

				{!hasMatches && (
					<p className="mt-1 text-sm text-muted-foreground">
						The regular expression did not match any part of the provided text.
					</p>
				)}

				{hasMatches && matchCount > MAX_HIGHLIGHT_MATCHES && (
					<p className="mt-2 text-sm text-muted-foreground">Too many matches to highlight inline — see Match Details below.</p>
				)}

				{hasMatches && matchCount <= MAX_HIGHLIGHT_MATCHES && (
					<pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground">
						{buildHighlightSegments(testString, matches).map((segment, index) =>
							segment.matched ? (
								<mark key={index} className="rounded-sm bg-primary/30 text-foreground">
									{segment.text}
								</mark>
							) : (
								<span key={index}>{segment.text}</span>
							),
						)}
					</pre>
				)}
			</div>
		</ToolPanel>
	);
}
