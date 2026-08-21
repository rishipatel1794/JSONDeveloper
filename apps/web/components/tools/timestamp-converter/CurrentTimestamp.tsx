"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RadioTower } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { formatShortTime } from "@/lib/tools/timestamp/timezone";

interface CurrentTimestampProps {
	timezone: string;
	onUseNow: () => void;
}

/**
 * Self-contained live clock — owns its own 1s interval so ticking only re-renders this component,
 * never the rest of the converter (which would otherwise re-render every second for no reason).
 */
export function CurrentTimestamp({ timezone, onUseNow }: CurrentTimestampProps) {
	// Starts `null` (not `new Date()`) so the server-rendered markup doesn't embed a timestamp that
	// will always differ, by definition, from the one rendered a moment later on the client — that
	// mismatch is what triggers a hydration error. The clock only starts ticking after mount.
	const [now, setNow] = useState<Date | null>(null);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		setNow(new Date());
		if (paused) return;
		const interval = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(interval);
	}, [paused]);

	return (
		<ToolPanel
			title="Current Time"
			icon={RadioTower}
			action={
				<Button onClick={() => setPaused(current => !current)} variant="ghost" size="sm" aria-pressed={paused}>
					{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
					{paused ? "Resume" : "Pause"}
				</Button>
			}
		>
			<div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-3 sm:divide-x sm:divide-y-0">
				<div className="px-4 py-3">
					<p className="text-xs font-medium text-muted-foreground">UTC</p>
					<p className="mt-0.5 font-mono text-lg text-foreground">{now ? formatShortTime(now, "UTC") : "--:--:--"}</p>
				</div>
				<div className="px-4 py-3">
					<p className="text-xs font-medium text-muted-foreground">Local ({timezone})</p>
					<p className="mt-0.5 font-mono text-lg text-foreground">{now ? formatShortTime(now, timezone) : "--:--:--"}</p>
				</div>
				<div className="px-4 py-3">
					<p className="text-xs font-medium text-muted-foreground">Unix</p>
					<p className="mt-0.5 font-mono text-lg text-foreground">{now ? Math.floor(now.getTime() / 1000) : "--"}</p>
				</div>
			</div>

			<div className="border-t border-border-subtle px-4 py-2.5">
				<Button onClick={onUseNow} variant="ghost" size="sm">
					Use this moment
				</Button>
			</div>
		</ToolPanel>
	);
}
