import { Zap } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolToolbar } from "@/components/tools/shared/ToolToolbar";
import { endOfDay, endOfMonth, endOfYear, startOfDay, startOfMonth, startOfYear } from "@/lib/tools/timestamp/timezone";

interface QuickActionsProps {
	timezone: string;
	onApply: (unixSeconds: string) => void;
}

export function QuickActions({ timezone, onApply }: QuickActionsProps) {
	const actions: { label: string; getMs: () => number }[] = [
		{ label: "Current Unix Seconds", getMs: () => Date.now() },
		{ label: "Start of Today", getMs: () => startOfDay(new Date(), timezone) },
		{ label: "End of Today", getMs: () => endOfDay(new Date(), timezone) },
		{ label: "Start of Month", getMs: () => startOfMonth(new Date(), timezone) },
		{ label: "End of Month", getMs: () => endOfMonth(new Date(), timezone) },
		{ label: "Start of Year", getMs: () => startOfYear(new Date(), timezone) },
		{ label: "End of Year", getMs: () => endOfYear(new Date(), timezone) },
	];

	return (
		<div>
			<h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
				<Zap className="size-4 text-muted-foreground" />
				Quick Actions
			</h2>
			<ToolToolbar>
				{actions.map(action => (
					<Button key={action.label} onClick={() => onApply(String(Math.floor(action.getMs() / 1000)))} variant="outline" size="sm">
						{action.label}
					</Button>
				))}
			</ToolToolbar>
		</div>
	);
}
