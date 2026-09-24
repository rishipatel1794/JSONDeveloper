import { CheckCircle2, XCircle } from "lucide-react";

import type { FindingCategory, Finding } from "@/lib/security-audit/types";
import { cn } from "@/lib/utils";

import { scoreColorClass } from "./severity";

interface CategoryCardProps {
	category: FindingCategory;
	score: number;
	findings: Finding[];
	active: boolean;
	onClick: () => void;
}

export function CategoryCard({ category, score, findings, active, onClick }: CategoryCardProps) {
	const hasIssue = findings.some(finding => finding.severity !== "PASS" && finding.severity !== "INFO");
	const Icon = hasIssue ? XCircle : CheckCircle2;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors",
				active ? "border-primary/50 bg-elevated" : "border-border bg-card hover:border-primary/30 hover:bg-elevated",
			)}
		>
			<div className="flex items-center gap-2.5">
				<Icon className={cn("size-4 shrink-0", hasIssue ? "text-warning" : "text-success")} />
				<span className="text-sm font-medium text-foreground">{category}</span>
			</div>
			<span className={cn("text-sm font-semibold tabular-nums", scoreColorClass(score))}>{score}</span>
		</button>
	);
}
