import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ToolToolbarProps {
	children: ReactNode;
	className?: string;
}

export function ToolToolbar({ children, className }: ToolToolbarProps) {
	return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}
