import { BarChart3 } from "lucide-react";
import Link from "next/link";

import { JsonStatistics } from "@/components/tools/json-validator/JsonStatistics";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { getStatusCode } from "@/lib/tools/http-status-codes/data";
import { CATEGORY_LABELS } from "@/lib/tools/http-status-codes/types";
import type { ResponseMeta } from "@/lib/tools/api-response-formatter/types";
import type { JsonStatistics as JsonStatisticsType } from "@/lib/tools/json-validator/types";

interface ResponseSummaryViewProps {
	meta: ResponseMeta;
	rootType: string;
	statistics: JsonStatisticsType | null;
	formattedOutput: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between px-4 py-2">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			<span className="text-sm text-foreground">{value}</span>
		</div>
	);
}

export function ResponseSummaryView({ meta, rootType, statistics, formattedOutput }: ResponseSummaryViewProps) {
	const statusEntry = meta.statusCode !== undefined ? getStatusCode(meta.statusCode) : undefined;

	return (
		<div className="space-y-4">
			<ToolPanel title="Response Overview" icon={BarChart3}>
				<div className="divide-y divide-border-subtle">
					<SummaryRow label="HTTP status code" value={meta.statusCode !== undefined ? String(meta.statusCode) : "Not provided"} />
					{statusEntry && (
						<SummaryRow
							label="Status meaning"
							value={`${statusEntry.title} (${CATEGORY_LABELS[statusEntry.category]})`}
						/>
					)}
					<SummaryRow label="HTTP method" value={meta.method ?? "Not provided"} />
					<SummaryRow label="Content-Type" value={meta.contentType ?? "Not provided"} />
					<SummaryRow label="JSON validity" value={statistics ? "Valid" : "Invalid or empty"} />
					<SummaryRow label="Root type" value={rootType} />
				</div>
				{meta.statusCode !== undefined && (
					<p className="border-t border-border-subtle px-4 py-2 text-xs text-muted-foreground">
						Look up any code in the{" "}
						<Link href={`/http-status-codes#status-${meta.statusCode}`} className="text-primary hover:underline">
							HTTP Status Code Reference
						</Link>
						.
					</p>
				)}
			</ToolPanel>

			{statistics && <JsonStatistics statistics={statistics} formattedOutput={formattedOutput} />}
		</div>
	);
}
