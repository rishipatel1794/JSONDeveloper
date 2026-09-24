import type { AuditReport } from "@/lib/security-audit/types";
import { cn } from "@/lib/utils";

import { scoreColorClass } from "./severity";

interface SecurityScoreProps {
	report: AuditReport;
}

export function SecurityScore({ report }: SecurityScoreProps) {
	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="font-mono text-xs font-semibold tracking-widest text-subtle-foreground">JSONDEVELOPER SECURITY SCORE</p>
					<div className="mt-1 flex items-baseline gap-2">
						<span className={cn("text-4xl font-bold tracking-tight", scoreColorClass(report.score))}>{report.score}</span>
						<span className="text-lg text-muted-foreground">/ 100</span>
					</div>
					<p className={cn("mt-1 text-sm font-medium", scoreColorClass(report.score))}>{report.rating}</p>
				</div>

				<p className="max-w-sm text-xs leading-relaxed text-subtle-foreground">
					This score reflects only the checks this tool performs — headers, HTTPS, cookies, CSP, CORS, mixed content, and information
					disclosure. It is not an official Google, OWASP, Mozilla, or industry-certified security rating.
				</p>
			</div>
		</div>
	);
}
