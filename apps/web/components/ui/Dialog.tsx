"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}

/**
 * Built on the native <dialog> element rather than a hand-rolled portal — showModal() gives us
 * focus trapping, Escape-to-close, and a backdrop for free, with no extra dependency.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;

		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			onClose={onClose}
			onCancel={onClose}
			onClick={event => {
				if (event.target === ref.current) onClose();
			}}
			aria-labelledby="dialog-title"
			className={cn(
				// Tailwind's preflight zeroes out margin on every element, which strips the native <dialog>'s
				// default `margin: auto` centering — restore it explicitly, or a modal opens pinned top-left.
				"m-auto max-h-[calc(100vh-3rem)] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-black/60",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
				<div>
					<h2 id="dialog-title" className="text-base font-semibold">
						{title}
					</h2>
					{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
				</div>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close dialog"
					className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
				>
					<X className="size-4" />
				</button>
			</div>

			<div className="px-5 py-4">{children}</div>
		</dialog>
	);
}
