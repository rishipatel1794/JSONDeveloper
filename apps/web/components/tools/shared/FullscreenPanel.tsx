"use client";

import { createPortal } from "react-dom";
import { Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface FullscreenButtonProps {
	isFullscreen: boolean;
	onToggle: () => void;
	label: string;
}

/** Icon-only toggle for the panel header — `label` names the panel (e.g. "JSON Input") for the accessible name. */
export function FullscreenButton({ isFullscreen, onToggle, label }: FullscreenButtonProps) {
	const Icon = isFullscreen ? Minimize2 : Maximize2;

	return (
		<button
			type="button"
			onClick={onToggle}
			aria-label={isFullscreen ? `Exit fullscreen: ${label}` : `Expand to fullscreen: ${label}`}
			title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
			className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<Icon className="size-3.5" />
		</button>
	);
}

interface FullscreenPanelProps {
	isFullscreen: boolean;
	children: React.ReactNode;
	className?: string;
}

/**
 * Renders `children` inline unless fullscreen, in which case it's portaled to `document.body` and
 * stretched to the viewport. A portal (rather than `position: fixed` in place) sidesteps clipping from
 * any ancestor's `overflow-hidden`/`transform` — both of which show up in this app's card/section chrome.
 */
export function FullscreenPanel({ isFullscreen, children, className }: FullscreenPanelProps) {
	if (!isFullscreen) return <>{children}</>;

	return createPortal(
		<div className={cn("fixed inset-0 z-50 flex flex-col bg-background", className)}>{children}</div>,
		document.body,
	);
}
