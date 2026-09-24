import type { AuditSummary as AuditSummaryData } from "@/lib/security-audit/types";
import { cn } from "@/lib/utils";

interface AuditSummaryProps {
	summary: AuditSummaryData;
}

const ROWS: { key: keyof AuditSummaryData; label: string; colorClass: string }[] = [
	{ key: "critical", label: "Critical", colorClass: "text-destructive" },
	{ key: "high", label: "High", colorClass: "text-destructive" },
	{ key: "medium", label: "Medium", colorClass: "text-warning" },
	{ key: "low", label: "Low", colorClass: "text-info" },
	{ key: "passed", label: "Passed", colorClass: "text-success" },
];

export function AuditSummary({ summary }: AuditSummaryProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
			{ROWS.map(row => (
				<div key={row.key} className="rounded-lg border border-border bg-card p-4 text-center">
					<p className={cn("text-2xl font-bold tracking-tight", colorFor(row.key, summary))}>{summary[row.key]}</p>
					<p className="mt-1 text-xs font-medium text-subtle-foreground">{row.label}</p>
				</div>
			))}
		</div>
	);
}

function colorFor(key: keyof AuditSummaryData, summary: AuditSummaryData): string {
	const row = ROWS.find(r => r.key === key)!;
	return summary[key] > 0 || key === "passed" ? row.colorClass : "text-subtle-foreground";
}
