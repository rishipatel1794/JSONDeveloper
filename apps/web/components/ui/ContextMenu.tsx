"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";

interface ContextMenuItem {
	label: string;
	onClick: () => void;
	destructive?: boolean;
}

interface ContextMenuProps {
	items: ContextMenuItem[];
	label: string;
}

export function ContextMenu({ items, label }: ContextMenuProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;

		function handleClick(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
		}
		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false);
		}

		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={event => {
					event.stopPropagation();
					setOpen(current => !current);
				}}
				aria-label={label}
				aria-haspopup="menu"
				aria-expanded={open}
				className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 data-[open=true]:opacity-100"
				data-open={open}
			>
				<MoreVertical className="size-3.5" />
			</button>

			{open && (
				<div role="menu" aria-label={label} className="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-md border border-border bg-card p-1 shadow-lg">
					{items.map(item => (
						<button
							key={item.label}
							type="button"
							role="menuitem"
							onClick={event => {
								event.stopPropagation();
								setOpen(false);
								item.onClick();
							}}
							className={cn(
								"block w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors hover:bg-secondary",
								item.destructive ? "text-destructive hover:bg-destructive-muted" : "text-foreground",
							)}
						>
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
