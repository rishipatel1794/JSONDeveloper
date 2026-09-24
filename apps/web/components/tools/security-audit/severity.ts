import { AlertCircle, AlertTriangle, CheckCircle2, Info, ShieldAlert, ShieldX, type LucideIcon } from "lucide-react";

import type { Severity } from "@/lib/security-audit/types";

interface SeverityStyle {
	label: Severity;
	icon: LucideIcon;
	badgeClass: string;
	iconClass: string;
	dotClass: string;
}

export const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
	CRITICAL: { label: "CRITICAL", icon: ShieldX, badgeClass: "border-destructive-border bg-destructive-muted text-destructive-muted-foreground", iconClass: "text-destructive", dotClass: "bg-destructive" },
	HIGH: { label: "HIGH", icon: ShieldAlert, badgeClass: "border-destructive-border bg-destructive-muted text-destructive-muted-foreground", iconClass: "text-destructive", dotClass: "bg-destructive" },
	MEDIUM: { label: "MEDIUM", icon: AlertTriangle, badgeClass: "border-warning/30 bg-warning/10 text-warning", iconClass: "text-warning", dotClass: "bg-warning" },
	LOW: { label: "LOW", icon: AlertCircle, badgeClass: "border-info/30 bg-info/10 text-info", iconClass: "text-info", dotClass: "bg-info" },
	INFO: { label: "INFO", icon: Info, badgeClass: "border-border bg-secondary text-muted-foreground", iconClass: "text-muted-foreground", dotClass: "bg-muted-foreground" },
	PASS: { label: "PASS", icon: CheckCircle2, badgeClass: "border-success-border bg-success-muted text-success-muted-foreground", iconClass: "text-success", dotClass: "bg-success" },
};

const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "PASS"];

export function sortBySeverity<T extends { severity: Severity }>(items: T[]): T[] {
	return [...items].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
}

export function scoreColorClass(score: number): string {
	if (score >= 90) return "text-success";
	if (score >= 70) return "text-primary";
	if (score >= 50) return "text-warning";
	return "text-destructive";
}
