import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
	neutral: "border-border bg-secondary text-muted-foreground",
	primary: "border-primary/30 bg-primary/10 text-primary-accent",
	success: "border-success-border bg-success-muted text-success-muted-foreground",
	destructive: "border-destructive-border bg-destructive-muted text-destructive-muted-foreground",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: keyof typeof VARIANTS;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
				VARIANTS[variant],
				className,
			)}
			{...props}
		/>
	);
}
