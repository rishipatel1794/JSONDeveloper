"use client";

import { Clock3 } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { formatCompact } from "@/lib/tools/timestamp/timezone";
import type { TimestampResult } from "@/lib/tools/timestamp/types";

interface TimestampResultsProps {
	result: TimestampResult;
}

function ResultRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3 px-4 py-2.5">
			<div className="min-w-0">
				<p className="text-xs font-medium text-muted-foreground">{label}</p>
				<p className="truncate font-mono text-sm text-foreground">{value}</p>
			</div>
			<CopyButton value={value} ariaLabel={`Copy ${label}`} />
		</div>
	);
}

function buildCopyAllText(result: TimestampResult): string {
	const date = new Date(Number(result.unixMilliseconds));
	return [
		`Unix Seconds: ${result.unixSeconds}`,
		`Unix Milliseconds: ${result.unixMilliseconds}`,
		`ISO 8601: ${result.iso}`,
		`UTC: ${formatCompact(date, "UTC")} UTC`,
		`Local: ${formatCompact(date, result.timezone)} ${result.timezone}`,
		`Relative: ${result.relative}`,
	].join("\n");
}

export function TimestampResults({ result }: TimestampResultsProps) {
	return (
		<ToolPanel title="Timestamp Result" icon={Clock3} action={<CopyButton value={buildCopyAllText(result)} label="Copy All" />}>
			<div className="divide-y divide-border-subtle">
				<ResultRow label="Unix Seconds" value={result.unixSeconds} />
				<ResultRow label="Unix Milliseconds" value={result.unixMilliseconds} />
				<ResultRow label="ISO 8601" value={result.iso} />
				<ResultRow label="UTC" value={result.utc} />
				<ResultRow label={`Local Time (${result.timezone})`} value={result.local} />
				<ResultRow label="Relative" value={result.relative} />
			</div>
		</ToolPanel>
	);
}
