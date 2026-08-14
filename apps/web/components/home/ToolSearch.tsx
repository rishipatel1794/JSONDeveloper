"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { categories, tools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export function ToolSearch() {
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				inputRef.current?.focus();
			}

			if (event.key === "Escape" && document.activeElement === inputRef.current) {
				setQuery("");
				inputRef.current?.blur();
			}
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	const results = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return [];

		return tools
			.filter(tool => {
				const category = categories.find(c => c.slug === tool.category)?.name ?? "";

				return (
					tool.name.toLowerCase().includes(trimmed) ||
					tool.description.toLowerCase().includes(trimmed) ||
					category.toLowerCase().includes(trimmed)
				);
			})
			.slice(0, 8);
	}, [query]);

	const isOpen = query.trim().length > 0;

	return (
		<div className="relative mx-auto w-full max-w-xl">
			<div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
				<Search className="size-4 shrink-0 text-muted-foreground" />

				<input
					ref={inputRef}
					type="search"
					value={query}
					onChange={event => setQuery(event.target.value)}
					placeholder="Search developer tools..."
					aria-label="Search developer tools"
					className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
				/>

				<kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline-flex">
					<span>⌘</span>K
				</kbd>
			</div>

			{isOpen && (
				<div className="absolute inset-x-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg">
					{results.length === 0 ? (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">No tools found for “{query.trim()}”.</p>
					) : (
						<ul className="space-y-0.5">
							{results.map(tool => {
								const Icon = tool.icon;

								return (
									<li key={tool.slug}>
										{tool.available ? (
											<Link
												href={tool.href}
												className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary"
												onClick={() => setQuery("")}
											>
												<Icon className="size-4 shrink-0 text-muted-foreground" />
												<span className="min-w-0 flex-1">
													<span className="block truncate text-sm font-medium text-foreground">{tool.name}</span>
													<span className="block truncate text-xs text-muted-foreground">{tool.description}</span>
												</span>
											</Link>
										) : (
											<div className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 opacity-60")}>
												<Icon className="size-4 shrink-0 text-muted-foreground" />
												<span className="min-w-0 flex-1">
													<span className="block truncate text-sm font-medium text-foreground">{tool.name}</span>
													<span className="block truncate text-xs text-muted-foreground">{tool.description}</span>
												</span>
												<span className="shrink-0 rounded-full border border-border-subtle px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
													Soon
												</span>
											</div>
										)}
									</li>
								);
							})}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
