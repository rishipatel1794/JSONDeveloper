import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ToolPanelProps {
	title: string;
	icon: LucideIcon;
	action?: ReactNode;
	children: ReactNode;
}

export function ToolPanel({ title, icon: Icon, action, children }: ToolPanelProps) {
	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
			<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
				<span className="flex items-center gap-2 text-sm font-medium">
					<Icon className="size-4 text-muted-foreground" />
					{title}
				</span>
				{action}
			</div>

			{children}
		</div>
	);
}
