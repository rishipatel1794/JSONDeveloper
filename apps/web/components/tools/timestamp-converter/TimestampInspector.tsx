import { AlertCircle, CheckCircle2, SearchCode } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { unitLabel } from "@/lib/tools/timestamp/converter";
import { describeDetectedKind } from "@/lib/tools/timestamp/detector";
import type { TimestampInspection } from "@/lib/tools/timestamp/types";

interface InspectorRowProps {
	label: string;
	value: string;
}

function InspectorRow({ label, value }: InspectorRowProps) {
	return (
		<div className="flex items-center justify-between gap-3 px-4 py-2.5">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			<span className="truncate font-mono text-sm text-foreground">{value}</span>
		</div>
	);
}

interface TimestampInspectorProps {
	inspection: TimestampInspection;
}

export function TimestampInspector({ inspection }: TimestampInspectorProps) {
	const relativeDirectionLabel =
		inspection.relativeDirection === "past" ? "Past" : inspection.relativeDirection === "future" ? "Future" : "Present";

	return (
		<ToolPanel title="Timestamp Inspector" icon={SearchCode}>
			<div className="divide-y divide-border-subtle">
				<div className="flex items-center gap-2 px-4 py-2.5">
					{inspection.valid ? (
						<CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
					) : (
						<AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
					)}
					<span className="text-sm font-medium text-foreground">{inspection.valid ? "Valid timestamp" : "Invalid timestamp"}</span>
				</div>

				<InspectorRow label="Detected" value={describeDetectedKind(inspection.detectedKind)} />

				{inspection.unit && <InspectorRow label="Precision" value={unitLabel(inspection.unit)} />}

				{inspection.valid && inspection.result && (
					<>
						<InspectorRow label="UTC" value={inspection.result.utc} />
						<InspectorRow label="Local" value={inspection.result.local} />
						<InspectorRow label="Timezone" value={inspection.result.timezone} />
						<InspectorRow label="Relative" value={`${inspection.result.relative} (${relativeDirectionLabel})`} />
					</>
				)}

				{!inspection.valid && inspection.error && (
					<div className="px-4 py-2.5">
						<span className="text-xs font-medium text-muted-foreground">Reason</span>
						<p className="mt-0.5 text-sm text-destructive">{inspection.error}</p>
					</div>
				)}
			</div>
		</ToolPanel>
	);
}
