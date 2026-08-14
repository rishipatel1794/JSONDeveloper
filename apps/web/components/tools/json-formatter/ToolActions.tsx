"use client";

import type { ReactNode } from "react";
import { Braces, Check, Copy, Download, Minimize2, Trash2 } from "lucide-react";

interface ToolActionsProps {
	onFormat: () => void;
	onMinify: () => void;
	onValidate: () => void;
	onCopy: () => void;
	onClear: () => void;
	onDownload: () => void;
	disabled?: boolean;
	hasOutput?: boolean;
}

interface ActionButtonProps {
	onClick: () => void;
	icon: ReactNode;
	label: string;
	variant?: "primary" | "secondary" | "ghost-destructive";
	disabled?: boolean;
}

function ActionButton({ onClick, icon, label, variant = "secondary", disabled }: ActionButtonProps) {
	const base =
		"inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

	const variants = {
		primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
		secondary: "border border-border bg-card text-foreground hover:bg-secondary",
		"ghost-destructive": "border border-border bg-card text-destructive hover:bg-destructive-muted hover:border-destructive-border",
	};

	return (
		<button type="button" onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
			{icon}
			{label}
		</button>
	);
}

export function ToolActions({ onFormat, onMinify, onValidate, onCopy, onClear, onDownload, disabled, hasOutput }: ToolActionsProps) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<ActionButton onClick={onFormat} icon={<Braces className="size-4" />} label="Format" variant="primary" disabled={disabled} />
			<ActionButton onClick={onMinify} icon={<Minimize2 className="size-4" />} label="Minify" disabled={disabled} />
			<ActionButton onClick={onValidate} icon={<Check className="size-4" />} label="Validate" disabled={disabled} />

			<div className="mx-1 hidden h-6 w-px bg-border sm:block" />

			<ActionButton onClick={onCopy} icon={<Copy className="size-4" />} label="Copy" disabled={!hasOutput} />
			<ActionButton onClick={onDownload} icon={<Download className="size-4" />} label="Download" disabled={!hasOutput} />

			<div className="ml-auto">
				<ActionButton onClick={onClear} icon={<Trash2 className="size-4" />} label="Clear" variant="ghost-destructive" />
			</div>
		</div>
	);
}
