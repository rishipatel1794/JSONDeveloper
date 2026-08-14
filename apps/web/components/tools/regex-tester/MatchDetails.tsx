import { ListChecks } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { RegexMatch } from "@/lib/tools/regex/types";
import { MAX_DETAILED_MATCHES } from "@/lib/tools/regex/utils";

import { CaptureGroups } from "./CaptureGroups";

interface MatchDetailsProps {
	matches: RegexMatch[];
}

export function MatchDetails({ matches }: MatchDetailsProps) {
	if (matches.length === 0) return null;

	const visible = matches.slice(0, MAX_DETAILED_MATCHES);

	return (
		<ToolPanel title="Match Details" icon={ListChecks}>
			<div className="divide-y divide-border-subtle">
				{visible.map((match, index) => (
					<div key={index} className="p-4">
						<p className="text-sm font-semibold text-foreground">Match #{index + 1}</p>

						<dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
							<div className="flex gap-2 sm:col-span-3">
								<dt className="shrink-0 text-muted-foreground">Value</dt>
								<dd className="break-all font-mono text-foreground">{match.value || "(empty match)"}</dd>
							</div>
							<div className="flex gap-2">
								<dt className="text-muted-foreground">Index</dt>
								<dd className="font-mono text-foreground">{match.index}</dd>
							</div>
							<div className="flex gap-2">
								<dt className="text-muted-foreground">Length</dt>
								<dd className="font-mono text-foreground">{match.length}</dd>
							</div>
						</dl>

						<div className="mt-2">
							<CaptureGroups match={match} />
						</div>
					</div>
				))}
			</div>

			{matches.length > MAX_DETAILED_MATCHES && (
				<p className="border-t border-border-subtle p-4 text-xs text-subtle-foreground">
					Showing first {MAX_DETAILED_MATCHES.toLocaleString()} of {matches.length.toLocaleString()} matches.
				</p>
			)}
		</ToolPanel>
	);
}
