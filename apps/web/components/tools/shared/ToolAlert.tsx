import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
	error: {
		icon: AlertCircle,
		classes: "border-destructive-border bg-destructive-muted text-destructive-muted-foreground",
	},
	success: {
		icon: CheckCircle2,
		classes: "border-success-border bg-success-muted text-success-muted-foreground",
	},
	warning: {
		icon: AlertTriangle,
		classes: "border-warning/30 bg-warning/10 text-warning",
	},
	info: {
		icon: Info,
		classes: "border-border bg-secondary text-muted-foreground",
	},
} as const;

interface ToolAlertProps {
	variant: keyof typeof VARIANTS;
	title?: string;
	children: ReactNode;
	icon?: LucideIcon;
}

export function ToolAlert({ variant, title, children, icon }: ToolAlertProps) {
	const Icon = icon ?? VARIANTS[variant].icon;

	return (
		<div
			role={variant === "error" ? "alert" : undefined}
			className={cn("flex items-start gap-3 rounded-lg border p-4 text-sm", VARIANTS[variant].classes)}
		>
			<Icon className="mt-0.5 size-4 shrink-0" />
			<div>
				{title && <p className="font-medium">{title}</p>}
				<div className={title ? "mt-0.5 opacity-90" : undefined}>{children}</div>
			</div>
		</div>
	);
}
