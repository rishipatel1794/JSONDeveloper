"use client";

import { useState } from "react";
import { Globe2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { formatOffsetLabel, formatShortTime, getZoneOffsetMinutes } from "@/lib/tools/timestamp/timezone";
import { cn } from "@/lib/utils";

import { TimezoneSelector } from "./TimezoneSelector";

export const MAX_COMPARISON_ZONES = 6;

interface TimezoneComparisonProps {
	epochMs: number;
	zones: string[];
	onAdd: (timezone: string) => void;
	onRemove: (timezone: string) => void;
}

export function TimezoneComparison({ epochMs, zones, onAdd, onRemove }: TimezoneComparisonProps) {
	const [adding, setAdding] = useState(false);
	const date = new Date(epochMs);
	const atLimit = zones.length >= MAX_COMPARISON_ZONES;

	return (
		<ToolPanel title="Compare Timezones" icon={Globe2}>
			<div className="divide-y divide-border-subtle">
				<div className="flex items-center justify-between gap-3 px-4 py-2.5">
					<span className="font-mono text-sm font-medium text-foreground">UTC</span>
					<span className="font-mono text-sm text-foreground">{formatShortTime(date, "UTC")}</span>
				</div>

				{zones.map(zone => (
					<div key={zone} className="flex items-center justify-between gap-3 px-4 py-2.5">
						<div className="min-w-0">
							<p className="truncate font-mono text-sm font-medium text-foreground">{zone}</p>
							<p className="text-xs text-subtle-foreground">{formatOffsetLabel(getZoneOffsetMinutes(date, zone))}</p>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<span className="font-mono text-sm text-foreground">{formatShortTime(date, zone)}</span>
							<button
								type="button"
								onClick={() => onRemove(zone)}
								aria-label={`Remove ${zone}`}
								className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
							>
								<X className="size-3.5" />
							</button>
						</div>
					</div>
				))}
			</div>

			<div className={cn("border-t border-border-subtle p-3", adding && "space-y-2")}>
				{adding ? (
					<TimezoneSelector
						label=""
						value=""
						defaultOpen
						onChange={timezone => {
							onAdd(timezone);
							setAdding(false);
						}}
					/>
				) : (
					<Button onClick={() => setAdding(true)} variant="ghost" size="sm" disabled={atLimit}>
						<Plus className="size-3.5" />
						{atLimit ? `Limit reached (${MAX_COMPARISON_ZONES})` : "Add Timezone"}
					</Button>
				)}
			</div>
		</ToolPanel>
	);
}
