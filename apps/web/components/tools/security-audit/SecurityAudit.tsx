"use client";

import { useMemo, useState } from "react";

import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { runSecurityAudit } from "@/lib/security-audit/client";
import { isAuditError, type AuditReport, type FindingCategory } from "@/lib/security-audit/types";
import { cn } from "@/lib/utils";

import { AuditSummary } from "./AuditSummary";
import { CategoryCard } from "./CategoryCard";
import { FindingCard } from "./FindingCard";
import { ReportActions } from "./ReportActions";
import { SecurityAuditForm } from "./SecurityAuditForm";
import { SecurityScore } from "./SecurityScore";
import { sortBySeverity } from "./severity";

const CATEGORIES: FindingCategory[] = ["Security Headers", "HTTPS", "Cookies", "Content Security", "CORS", "Information Disclosure", "Mixed Content"];

export function SecurityAudit() {
	const [report, setReport] = useState<AuditReport | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [activeCategory, setActiveCategory] = useState<FindingCategory | null>(null);

	async function handleSubmit(url: string) {
		setIsLoading(true);
		setError(null);
		setReport(null);
		setActiveCategory(null);

		try {
			const result = await runSecurityAudit(url);
			if (isAuditError(result)) {
				setError(result.error);
			} else {
				setReport(result);
			}
		} finally {
			setIsLoading(false);
		}
	}

	const visibleFindings = useMemo(() => {
		if (!report) return [];
		const filtered = activeCategory ? report.findings.filter(finding => finding.category === activeCategory) : report.findings;
		return sortBySeverity(filtered);
	}, [report, activeCategory]);

	return (
		<div className="space-y-6">
			<SecurityAuditForm onSubmit={handleSubmit} isLoading={isLoading} />

			{error && <ToolAlert variant="error" title="Couldn't complete this audit">{error}</ToolAlert>}

			{isLoading && (
				<div className="flex items-center justify-center rounded-xl border border-border bg-card p-12 text-sm text-muted-foreground">
					Analyzing the target site — this can take a few seconds…
				</div>
			)}

			{report && (
				<div className="space-y-6">
					<div>
						<h2 className="text-lg font-semibold text-foreground">
							Security Audit — <span className="text-muted-foreground">{report.url}</span>
						</h2>
						<p className="text-xs text-subtle-foreground">Generated {new Date(report.timestamp).toLocaleString()}</p>
					</div>

					<SecurityScore report={report} />
					<AuditSummary summary={report.summary} />

					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Categories</p>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							<button
								type="button"
								onClick={() => setActiveCategory(null)}
								className={cn(
									"rounded-lg border p-4 text-left text-sm font-medium transition-colors",
									activeCategory === null ? "border-primary/50 bg-elevated text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-elevated",
								)}
							>
								All findings ({report.findings.length})
							</button>

							{CATEGORIES.map(category => (
								<CategoryCard
									key={category}
									category={category}
									score={report.categories[category].score}
									findings={report.findings.filter(finding => finding.category === category)}
									active={activeCategory === category}
									onClick={() => setActiveCategory(current => (current === category ? null : category))}
								/>
							))}
						</div>
					</div>

					<div className="flex items-center justify-between gap-3">
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">
							Findings{activeCategory ? ` — ${activeCategory}` : ""}
						</p>
						<ReportActions report={report} />
					</div>

					<div className="space-y-2">
						{visibleFindings.map(finding => (
							<FindingCard key={finding.id} finding={finding} defaultOpen={finding.severity === "CRITICAL" || finding.severity === "HIGH"} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
