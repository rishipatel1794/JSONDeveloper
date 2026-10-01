"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { downloadTextFile } from "@/lib/download";
import { generateAuditPdf } from "@/lib/security-audit/pdf";
import type { AuditReport } from "@/lib/security-audit/types";

interface ReportActionsProps {
	report: AuditReport;
}

function buildSummaryText(report: AuditReport): string {
	const lines = [
		`Security Audit — ${report.url}`,
		`Score: ${report.score}/100 (${report.rating})`,
		`Critical: ${report.summary.critical}  High: ${report.summary.high}  Medium: ${report.summary.medium}  Low: ${report.summary.low}  Passed: ${report.summary.passed}`,
		"",
		...report.findings
			.filter(finding => finding.severity !== "PASS")
			.map(finding => `[${finding.severity}] ${finding.title}`),
	];
	return lines.join("\n");
}

export function ReportActions({ report }: ReportActionsProps) {
	const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

	function handleDownloadJson() {
		const hostname = (() => {
			try {
				return new URL(report.url).hostname;
			} catch {
				return "report";
			}
		})();
		downloadTextFile(JSON.stringify(report, null, 2), `security-audit-${hostname}.json`, "application/json");
	}

	async function handleDownloadPdf() {
		if (isGeneratingPdf) return;
		setIsGeneratingPdf(true);
		try {
			await generateAuditPdf(report);
		} finally {
			setIsGeneratingPdf(false);
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button onClick={handleDownloadPdf} variant="outline" size="sm" disabled={isGeneratingPdf}>
				{isGeneratingPdf ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
				{isGeneratingPdf ? "Generating…" : "Download PDF"}
			</Button>
			<Button onClick={handleDownloadJson} variant="outline" size="sm">
				<Download className="size-3.5" />
				Download JSON
			</Button>
			<CopyButton value={buildSummaryText(report)} label="Copy Summary" />
		</div>
	);
}
