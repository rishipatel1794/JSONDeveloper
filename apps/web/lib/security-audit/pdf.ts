import type { UserOptions } from "jspdf-autotable";

import type { AuditReport, Finding, FindingCategory, Severity } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsPDF's own type isn't worth importing just for this internal signature
type AutoTableFn = (doc: any, options: UserOptions) => void;

/**
 * Loaded on demand (not at page load) since jsPDF + autotable are sizable and only needed on click.
 * jspdf-autotable ships a UMD bundle whose real `autoTable` function ends up nested one level deeper
 * than a plain `.default` under Node/webpack's CJS interop (confirmed by inspecting the actual module
 * namespace at runtime) — unwrap defensively instead of assuming either shape.
 */
async function loadPdfLibs() {
	const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
	const rawExport = autoTableModule.default as unknown;
	const autoTable = (typeof rawExport === "function" ? rawExport : (rawExport as { default?: unknown })?.default) as AutoTableFn;
	return { JsPDF: jsPDF, autoTable };
}

const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "PASS"];

const SEVERITY_COLORS: Record<Severity, [number, number, number]> = {
	CRITICAL: [185, 28, 28],
	HIGH: [220, 38, 38],
	MEDIUM: [217, 119, 6],
	LOW: [37, 99, 235],
	INFO: [100, 116, 139],
	PASS: [22, 163, 74],
};

const CATEGORY_ORDER: FindingCategory[] = [
	"HTTPS",
	"Security Headers",
	"Content Security",
	"Cookies",
	"CORS",
	"Information Disclosure",
	"Mixed Content",
];

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function scoreColor(score: number): [number, number, number] {
	if (score >= 90) return [22, 163, 74];
	if (score >= 70) return [37, 99, 235];
	if (score >= 50) return [217, 119, 6];
	return [185, 28, 28];
}

function hostnameFromUrl(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return "report";
	}
}

export async function generateAuditPdf(report: AuditReport): Promise<void> {
	const { JsPDF, autoTable } = await loadPdfLibs();
	const doc = new JsPDF({ unit: "mm", format: "a4" });
	const hostname = hostnameFromUrl(report.url);
	const generatedAt = new Date(report.timestamp);

	let cursorY = MARGIN;

	function ensureSpace(height: number): void {
		if (cursorY + height > PAGE_HEIGHT - MARGIN) {
			doc.addPage();
			cursorY = MARGIN;
		}
	}

	function addFooters(): void {
		const pageCount = doc.getNumberOfPages();
		for (let page = 1; page <= pageCount; page++) {
			doc.setPage(page);
			doc.setDrawColor(226, 232, 240);
			doc.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
			doc.setFontSize(8);
			doc.setTextColor(100, 116, 139);
			doc.text("JSONDeveloper Security Audit — jsondeveloper.com/security-audit", MARGIN, PAGE_HEIGHT - 9);
			doc.text(`Page ${page} of ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9, { align: "right" });
		}
	}

	// --- Header ---
	doc.setFillColor(15, 23, 42);
	doc.rect(0, 0, PAGE_WIDTH, 36, "F");
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(18);
	doc.setFont("helvetica", "bold");
	doc.text("Website Security Audit Report", MARGIN, 16);
	doc.setFontSize(11);
	doc.setFont("helvetica", "normal");
	doc.text(report.url, MARGIN, 24);
	doc.setFontSize(9);
	doc.setTextColor(203, 213, 225);
	doc.text(`Generated ${generatedAt.toLocaleString()}`, MARGIN, 31);

	cursorY = 46;

	// --- Score block ---
	const [sr, sg, sb] = scoreColor(report.score);
	doc.setFillColor(sr, sg, sb);
	doc.roundedRect(MARGIN, cursorY, 38, 24, 2, 2, "F");
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(20);
	doc.setFont("helvetica", "bold");
	doc.text(String(report.score), MARGIN + 19, cursorY + 13, { align: "center" });
	doc.setFontSize(8);
	doc.setFont("helvetica", "normal");
	doc.text("/ 100", MARGIN + 19, cursorY + 19, { align: "center" });

	doc.setTextColor(15, 23, 42);
	doc.setFontSize(13);
	doc.setFont("helvetica", "bold");
	doc.text(`${report.rating} — JSONDeveloper Security Score`, MARGIN + 44, cursorY + 9);
	doc.setFontSize(8.5);
	doc.setFont("helvetica", "normal");
	doc.setTextColor(71, 85, 105);
	const disclaimer = doc.splitTextToSize(
		"This is an independent, heuristic score based on passive checks performed by this tool. It is not an official Google, OWASP, Mozilla, or industry-certified security rating.",
		CONTENT_WIDTH - 44,
	);
	doc.text(disclaimer, MARGIN + 44, cursorY + 15);

	cursorY += 32;

	// --- Summary table ---
	const summaryRows: [string, number, [number, number, number]][] = [
		["Critical", report.summary.critical, SEVERITY_COLORS.CRITICAL],
		["High", report.summary.high, SEVERITY_COLORS.HIGH],
		["Medium", report.summary.medium, SEVERITY_COLORS.MEDIUM],
		["Low", report.summary.low, SEVERITY_COLORS.LOW],
		["Info", report.summary.info, SEVERITY_COLORS.INFO],
		["Passed", report.summary.passed, SEVERITY_COLORS.PASS],
	];

	autoTable(doc, {
		startY: cursorY,
		margin: { left: MARGIN, right: MARGIN },
		head: [["Severity", "Count"]],
		body: summaryRows.map(([label, count]) => [label, String(count)]),
		theme: "grid",
		headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
		bodyStyles: { fontSize: 9 },
		columnStyles: { 1: { halign: "center", cellWidth: 24 } },
		didParseCell: cell => {
			const row = summaryRows[cell.row.index];
			if (cell.section === "body" && cell.column.index === 0 && row) {
				cell.cell.styles.textColor = row[2];
				cell.cell.styles.fontStyle = "bold";
			}
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- jspdf-autotable attaches this at runtime; no public type export for it
	cursorY = (doc as any).lastAutoTable.finalY + 8;

	// --- Category scores ---
	ensureSpace(14);
	doc.setFontSize(11);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(15, 23, 42);
	doc.text("Category Breakdown", MARGIN, cursorY);
	cursorY += 4;

	autoTable(doc, {
		startY: cursorY,
		margin: { left: MARGIN, right: MARGIN },
		head: [["Category", "Score", "Findings"]],
		body: CATEGORY_ORDER.map(category => {
			const cat = report.categories[category];
			return [category, `${cat.score}/100`, String(cat.findingIds.length)];
		}),
		theme: "striped",
		headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
		bodyStyles: { fontSize: 9 },
		columnStyles: { 1: { halign: "center", cellWidth: 22 }, 2: { halign: "center", cellWidth: 22 } },
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
	cursorY = (doc as any).lastAutoTable.finalY + 10;

	// --- Findings ---
	const actionableFindings = report.findings.filter(finding => finding.severity !== "PASS");
	const sortedFindings = [...actionableFindings].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

	ensureSpace(14);
	doc.setFontSize(11);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(15, 23, 42);
	doc.text(`Findings (${sortedFindings.length})`, MARGIN, cursorY);
	cursorY += 7;

	if (sortedFindings.length === 0) {
		doc.setFontSize(9.5);
		doc.setFont("helvetica", "normal");
		doc.setTextColor(71, 85, 105);
		doc.text("No actionable findings — every check on this page passed.", MARGIN, cursorY);
		cursorY += 8;
	}

	function renderFinding(finding: Finding): void {
		const [r, g, b] = SEVERITY_COLORS[finding.severity];
		const titleLines = doc.splitTextToSize(finding.title, CONTENT_WIDTH - 24);
		const descLines = doc.splitTextToSize(finding.description, CONTENT_WIDTH - 6);
		const impactLines = doc.splitTextToSize(`Why it matters: ${finding.impact}`, CONTENT_WIDTH - 6);
		const recLines = doc.splitTextToSize(`Recommendation: ${finding.recommendation}`, CONTENT_WIDTH - 6);

		const blockHeight = Math.max(9, titleLines.length * 4.6 + 4) + descLines.length * 4.2 + impactLines.length * 4.2 + recLines.length * 4.2 + 6;
		ensureSpace(blockHeight);

		doc.setFillColor(r, g, b);
		doc.roundedRect(MARGIN, cursorY, 20, 5.5, 1, 1, "F");
		doc.setTextColor(255, 255, 255);
		doc.setFontSize(7);
		doc.setFont("helvetica", "bold");
		doc.text(finding.severity, MARGIN + 10, cursorY + 3.8, { align: "center" });

		doc.setTextColor(15, 23, 42);
		doc.setFontSize(9.5);
		doc.setFont("helvetica", "bold");
		doc.text(titleLines, MARGIN + 24, cursorY + 4);

		cursorY += Math.max(9, titleLines.length * 4.6 + 4);

		doc.setFont("helvetica", "normal");
		doc.setFontSize(8.5);
		doc.setTextColor(51, 65, 85);
		doc.text(descLines, MARGIN, cursorY);
		cursorY += descLines.length * 4.2 + 1.5;

		doc.setTextColor(71, 85, 105);
		doc.text(impactLines, MARGIN, cursorY);
		cursorY += impactLines.length * 4.2 + 1.5;

		doc.setTextColor(22, 101, 52);
		doc.text(recLines, MARGIN, cursorY);
		cursorY += recLines.length * 4.2 + 3;

		doc.setDrawColor(226, 232, 240);
		doc.line(MARGIN, cursorY, PAGE_WIDTH - MARGIN, cursorY);
		cursorY += 4;
	}

	for (const finding of sortedFindings) {
		renderFinding(finding);
	}

	addFooters();
	doc.save(`security-audit-${hostname}.pdf`);
}
