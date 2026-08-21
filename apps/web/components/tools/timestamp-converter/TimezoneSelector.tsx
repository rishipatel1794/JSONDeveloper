"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Search } from "lucide-react";

import { formatOffsetLabel, getZoneOffsetMinutes, isValidTimezone, listTimezones } from "@/lib/tools/timestamp/timezone";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 60;

interface TimezoneSelectorProps {
	value: string;
	onChange: (timezone: string) => void;
	label?: string;
	id?: string;
	className?: string;
	defaultOpen?: boolean;
}

export function TimezoneSelector({ value, onChange, label = "Timezone", id, className, defaultOpen = false }: TimezoneSelectorProps) {
	const [open, setOpen] = useState(defaultOpen);
	const [query, setQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const now = useRef(new Date()).current;
	const allZones = useMemo(() => listTimezones(), []);

	const results = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		const matches = trimmed ? allZones.filter(zone => zone.toLowerCase().includes(trimmed)) : allZones;
		return matches.slice(0, MAX_RESULTS);
	}, [allZones, query]);

	useEffect(() => {
		if (!open) return;

		function handleClick(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
		}
		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false);
		}

		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		searchInputRef.current?.focus();

		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	return (
		<div ref={containerRef} className={cn("relative", className)}>
			{label && (
				<span id={id ? `${id}-label` : undefined} className="mb-1 block text-xs font-medium text-muted-foreground">
					{label}
				</span>
			)}

			<button
				type="button"
				onClick={() => setOpen(current => !current)}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-labelledby={id ? `${id}-label` : undefined}
				className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Globe2 className="size-4 shrink-0 text-muted-foreground" />
				<span className="min-w-0 flex-1 truncate font-mono">{value || "Select timezone..."}</span>
				{value && isValidTimezone(value) && (
					<span className="shrink-0 text-xs text-subtle-foreground">{formatOffsetLabel(getZoneOffsetMinutes(now, value))}</span>
				)}
				<ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
			</button>

			{open && (
				<div
					role="listbox"
					aria-label={label}
					className="absolute z-20 mt-1 w-full min-w-64 overflow-hidden rounded-md border border-border bg-card shadow-lg"
				>
					<div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
						<Search className="size-3.5 shrink-0 text-muted-foreground" />
						<input
							ref={searchInputRef}
							type="text"
							value={query}
							onChange={event => setQuery(event.target.value)}
							placeholder="Search timezone..."
							aria-label="Search timezone"
							className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
						/>
					</div>

					<div className="max-h-64 overflow-y-auto p-1">
						{results.length === 0 && <p className="px-2.5 py-3 text-sm text-muted-foreground">No matching timezones.</p>}

						{results.map(zone => {
							const selected = zone === value;
							return (
								<button
									key={zone}
									type="button"
									role="option"
									aria-selected={selected}
									onClick={() => {
										onChange(zone);
										setOpen(false);
										setQuery("");
									}}
									className={cn(
										"flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
										selected ? "text-primary-accent" : "text-foreground",
									)}
								>
									<Check className={cn("size-3.5 shrink-0", selected ? "opacity-100" : "opacity-0")} />
									<span className="min-w-0 flex-1 truncate font-mono">{zone}</span>
									<span className="shrink-0 text-xs text-subtle-foreground">{formatOffsetLabel(getZoneOffsetMinutes(now, zone))}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
