import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";

const BULLETS = ["UTC", "Local time", "ISO 8601", "Unix seconds", "Unix milliseconds", "Relative time", "Timezone conversions"];

interface TimestampEmptyStateProps {
	onUseCurrentTime: () => void;
}

export function TimestampEmptyState({ onUseCurrentTime }: TimestampEmptyStateProps) {
	return (
		<div className="rounded-xl border border-dashed border-border p-8 text-center">
			<Sparkles className="mx-auto size-6 text-muted-foreground" />
			<h2 className="mt-3 text-base font-semibold text-foreground">Convert timestamps instantly</h2>
			<p className="mt-1.5 text-sm text-muted-foreground">Enter a Unix timestamp or date above to get:</p>

			<ul className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-1.5 text-left text-sm text-muted-foreground sm:grid-cols-3">
				{BULLETS.map(bullet => (
					<li key={bullet} className="flex items-center gap-1.5">
						<span className="size-1 shrink-0 rounded-full bg-muted-foreground" />
						{bullet}
					</li>
				))}
			</ul>

			<Button onClick={onUseCurrentTime} variant="outline" size="sm" className="mt-5">
				Use Current Time
			</Button>
		</div>
	);
}
