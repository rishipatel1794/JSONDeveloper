import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ToolPageContainerProps {
	children: ReactNode;
	/**
	 * Editor-workspace tools (paste-in/paste-out panels) benefit from more horizontal room on large
	 * screens than documentation-style content does — 1600px matches the width already established by
	 * the API Client page, rather than introducing a new arbitrary value.
	 */
	wide?: boolean;
	className?: string;
}

export function ToolPageContainer({ children, wide = false, className }: ToolPageContainerProps) {
	return <div className={cn("container mx-auto px-4 py-10", wide ? "max-w-[1600px]" : "max-w-7xl", className)}>{children}</div>;
}
