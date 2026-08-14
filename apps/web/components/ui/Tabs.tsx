"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TabItem {
	value: string;
	label: string;
}

interface TabListProps {
	items: TabItem[];
	value: string;
	onChange: (value: string) => void;
	"aria-label": string;
}

export function TabList({ items, value, onChange, "aria-label": ariaLabel }: TabListProps) {
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
		let nextIndex: number | null = null;

		if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
		else if (event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
		else if (event.key === "Home") nextIndex = 0;
		else if (event.key === "End") nextIndex = items.length - 1;

		if (nextIndex === null) return;

		const next = items[nextIndex];
		if (!next) return;

		event.preventDefault();
		onChange(next.value);
		buttonRefs.current[next.value]?.focus();
	}

	return (
		<div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-1 border-b border-border">
			{items.map((item, index) => {
				const isActive = item.value === value;

				return (
					<button
						key={item.value}
						ref={el => {
							buttonRefs.current[item.value] = el;
						}}
						type="button"
						role="tab"
						id={`tab-${item.value}`}
						aria-selected={isActive}
						aria-controls={`tabpanel-${item.value}`}
						tabIndex={isActive ? 0 : -1}
						onClick={() => onChange(item.value)}
						onKeyDown={event => handleKeyDown(event, index)}
						className={cn(
							"-mb-px rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{item.label}
					</button>
				);
			})}
		</div>
	);
}

interface TabPanelProps {
	value: string;
	activeValue: string;
	children: ReactNode;
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
	if (value !== activeValue) return null;

	return (
		<div role="tabpanel" id={`tabpanel-${value}`} aria-labelledby={`tab-${value}`} tabIndex={0}>
			{children}
		</div>
	);
}
