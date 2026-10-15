import { CheckCircle2, Info } from "lucide-react";

import type { AnalysisFinding } from "@/lib/tools/api-response-formatter/types";

export function AnalysisView({ findings }: { findings: AnalysisFinding[] }) {
	return (
		<div className="space-y-2">
			{findings.map(finding => (
				<div
					key={finding.id}
					className={
						finding.tone === "positive"
							? "flex items-start gap-3 rounded-lg border border-success-border bg-success-muted p-3 text-sm"
							: "flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm"
					}
				>
					{finding.tone === "positive" ? (
						<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
					) : (
						<Info className="mt-0.5 size-4 shrink-0 text-info" />
					)}
					<div>
						<p className="font-medium text-foreground">{finding.title}</p>
						<p className="mt-0.5 text-muted-foreground">{finding.detail}</p>
					</div>
				</div>
			))}
		</div>
	);
}
