import { BarChart3 } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { JsonStatistics as JsonStatisticsType } from "@/lib/tools/json-validator/types";
import { computeUtf8ByteLength, formatBytes } from "@/lib/tools/json-validator/utils";

interface JsonStatisticsProps {
	statistics: JsonStatisticsType;
	formattedOutput: string;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex items-center justify-between px-4 py-2">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			<span className="font-mono text-sm text-foreground">{value}</span>
		</div>
	);
}

export function JsonStatistics({ statistics, formattedOutput }: JsonStatisticsProps) {
	const formattedBytes = computeUtf8ByteLength(formattedOutput);

	return (
		<ToolPanel title="JSON Statistics" icon={BarChart3}>
			<div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-2 sm:divide-x sm:divide-y-0">
				<div className="divide-y divide-border-subtle">
					<StatRow label="Objects" value={statistics.objects} />
					<StatRow label="Arrays" value={statistics.arrays} />
					<StatRow label="Keys" value={statistics.keys} />
					<StatRow label="Strings" value={statistics.strings} />
					<StatRow label="Numbers" value={statistics.numbers} />
				</div>
				<div className="divide-y divide-border-subtle">
					<StatRow label="Booleans" value={statistics.booleans} />
					<StatRow label="Null values" value={statistics.nulls} />
					<StatRow label="Total nodes" value={statistics.totalNodes} />
					<StatRow label="Max depth" value={statistics.maxDepth} />
					<StatRow label="Raw size" value={formatBytes(statistics.sizeBytes)} />
				</div>
			</div>
			<div className="border-t border-border-subtle px-4 py-2">
				<StatRow label="Formatted size" value={formatBytes(formattedBytes)} />
			</div>
		</ToolPanel>
	);
}
