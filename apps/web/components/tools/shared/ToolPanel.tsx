"use client";

import type { LucideIcon } from "lucide-react";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { FullscreenButton, FullscreenPanel } from "./FullscreenPanel";
import { useFullscreenPanel } from "./useFullscreenPanel";

interface ToolPanelProps {
	title: string;
	icon: LucideIcon;
	action?: ReactNode;
	/** Rendered below the content, above a top border — e.g. a row of format/minify/clear buttons. */
	footer?: ReactNode;
	/**
	 * Adds a fullscreen toggle to the header. While active, `children` — expected to be a single element
	 * that accepts a `height` prop, such as `CodeEditor` — is cloned with `height="100%"` so it fills the
	 * viewport instead of staying pinned to its normal fixed height.
	 */
	enableFullscreen?: boolean;
	children: ReactNode;
}

export function ToolPanel({ title, icon: Icon, action, footer, enableFullscreen = false, children }: ToolPanelProps) {
	const { isFullscreen, toggle } = useFullscreenPanel();
	const active = enableFullscreen && isFullscreen;

	const content = active && isValidElement(children) ? cloneElement(children as ReactElement<{ height?: string }>, { height: "100%" }) : children;

	return (
		<FullscreenPanel isFullscreen={active}>
			<div className={cn("flex flex-col overflow-hidden bg-card", active ? "h-full" : "rounded-xl border border-border shadow-sm")}>
				<div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
					<span className="flex items-center gap-2 text-sm font-medium">
						<Icon className="size-4 text-muted-foreground" />
						{title}
					</span>

					<div className="flex items-center gap-2">
						{action}
						{enableFullscreen && <FullscreenButton isFullscreen={isFullscreen} onToggle={toggle} label={title} />}
					</div>
				</div>

				<div className="min-h-0 flex-1">{content}</div>

				{footer && <div className="shrink-0 border-t border-border">{footer}</div>}
			</div>
		</FullscreenPanel>
	);
}
