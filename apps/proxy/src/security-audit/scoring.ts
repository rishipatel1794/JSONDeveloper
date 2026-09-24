import type { AuditSummary, CategoryScore, Finding, FindingCategory, Severity } from "./types";

const ALL_CATEGORIES: FindingCategory[] = ["Security Headers", "HTTPS", "Cookies", "Content Security", "CORS", "Information Disclosure", "Mixed Content"];

/** How many points a single finding of this severity costs its category. PASS/INFO cost nothing. */
const SEVERITY_DEDUCTION: Record<Severity, number> = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 12,
  LOW: 5,
  INFO: 0,
  PASS: 0,
};

export function summarizeFindings(findings: Finding[]): AuditSummary {
  const summary: AuditSummary = { critical: 0, high: 0, medium: 0, low: 0, info: 0, passed: 0 };

  for (const finding of findings) {
    switch (finding.severity) {
      case "CRITICAL":
        summary.critical++;
        break;
      case "HIGH":
        summary.high++;
        break;
      case "MEDIUM":
        summary.medium++;
        break;
      case "LOW":
        summary.low++;
        break;
      case "INFO":
        summary.info++;
        break;
      case "PASS":
        summary.passed++;
        break;
    }
  }

  return summary;
}

export function scoreCategories(findings: Finding[]): Record<FindingCategory, CategoryScore> {
  const result = {} as Record<FindingCategory, CategoryScore>;

  for (const category of ALL_CATEGORIES) {
    const categoryFindings = findings.filter(finding => finding.category === category);
    const deduction = categoryFindings.reduce((total, finding) => total + SEVERITY_DEDUCTION[finding.severity], 0);

    result[category] = {
      score: Math.max(0, 100 - deduction),
      findingIds: categoryFindings.map(finding => finding.id),
    };
  }

  return result;
}

export function computeOverallScore(categories: Record<FindingCategory, CategoryScore>): number {
  const scores = Object.values(categories).map(category => category.score);
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

export function scoreToRating(score: number): "Excellent" | "Good" | "Fair" | "Poor" {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}
