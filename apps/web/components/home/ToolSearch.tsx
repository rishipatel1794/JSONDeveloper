"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { categories, tools, type ToolDefinition } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

const SEARCH_HINTS = ["JSON", "API", "JWT", "SQL", "Regex", "Cron", "Docker"];

/**
 * Lower number = better match. Checked in the order the spec asks for: exact name, name starts with,
 * name contains, keyword match, description match, category match. Returns null for no match at all.
 */
function rankTool(tool: ToolDefinition, query: string, categoryName: string): number | null {
	const name = tool.name.toLowerCase();

	if (name === query) return 1;
	if (name.startsWith(query)) return 2;
	if (name.includes(query)) return 3;
	if (tool.keywords?.some(keyword => keyword.toLowerCase().includes(query))) return 4;
	if (tool.description.toLowerCase().includes(query)) return 5;
	if (categoryName.toLowerCase().includes(query)) return 6;

	return null;
}

export function ToolSearch() {
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				inputRef.current?.focus();
				return;
			}

			if (event.key === "/" && document.activeElement !== inputRef.current) {
				const target = document.activeElement;
				const isTyping = target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
				if (!isTyping) {
					event.preventDefault();
					inputRef.current?.focus();
				}
				return;
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
			.map(tool => {
				const categoryName = categories.find(c => c.slug === tool.category)?.name ?? "";
				const rank = rankTool(tool, trimmed, categoryName);
				return rank === null ? null : { tool, rank };
			})
			.filter((entry): entry is { tool: ToolDefinition; rank: number } => entry !== null)
			.sort((a, b) => a.rank - b.rank)
			.slice(0, 8)
			.map(entry => entry.tool);
	}, [query]);

	useEffect(() => {
		setActiveIndex(0);
	}, [query]);

	const isOpen = query.trim().length > 0;

	function goToTool(tool: ToolDefinition) {
		if (!tool.available) return;
		setQuery("");
		router.push(tool.href);
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (!isOpen || results.length === 0) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex(index => (index + 1) % results.length);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex(index => (index - 1 + results.length) % results.length);
		} else if (event.key === "Enter") {
			event.preventDefault();
			const tool = results[activeIndex];
			if (tool) goToTool(tool);
		}
	}

	let previousCategory: string | null = null;

	return (
		<div className="relative mx-auto w-full max-w-xl">
			<div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--color-primary)_/_15%,0_0_24px_-8px_var(--color-primary)]">
				<span className="flex shrink-0 select-none items-center font-mono text-sm font-semibold text-primary" aria-hidden="true">
					&gt;
					<span className={cn("ml-1 h-4 w-[7px] bg-primary", !isFocused && !query ? "animate-terminal-blink" : "opacity-0")} />
				</span>

				<input
					ref={inputRef}
					type="search"
					value={query}
					onChange={event => setQuery(event.target.value)}
					onKeyDown={handleInputKeyDown}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder="Search developer tools..."
					aria-label="Search developer tools"
					role="combobox"
					aria-expanded={isOpen}
					aria-controls="tool-search-results"
					aria-activedescendant={isOpen && results[activeIndex] ? `tool-search-result-${results[activeIndex].slug}` : undefined}
					autoComplete="off"
					className="w-full bg-transparent font-mono text-sm text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:outline-none"
				/>

				<kbd className="hidden shrink-0 items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline-flex">
					/
				</kbd>
			</div>

			{isOpen && (
				<div
					id="tool-search-results"
					role="listbox"
					aria-label="Search results"
					className="absolute inset-x-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg"
				>
					{results.length === 0 ? (
						<div className="px-3 py-6 text-center text-sm text-muted-foreground">
							<p>No tools found.</p>
							<p className="mt-1 text-xs">Try searching for: {SEARCH_HINTS.join(", ")}…</p>
						</div>
					) : (
						<ul className="space-y-0.5">
							{results.map((tool, index) => {
								const Icon = tool.icon;
								const isActive = index === activeIndex;
								const categoryName = categories.find(c => c.slug === tool.category)?.name ?? "";
								const showHeader = categoryName !== previousCategory;
								previousCategory = categoryName;

								return (
									<li key={tool.slug} role="presentation">
										{showHeader && (
											<div role="presentation" className="px-3 pb-1 pt-2 font-mono text-[10px] font-semibold tracking-widest text-subtle-foreground first:pt-1">
												{categoryName.toUpperCase()}
											</div>
										)}
										<div id={`tool-search-result-${tool.slug}`} role="option" aria-selected={isActive}>
											{tool.available ? (
												<Link
													href={tool.href}
													onClick={() => setQuery("")}
													onMouseEnter={() => setActiveIndex(index)}
													className={cn(
														"flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
														isActive ? "bg-secondary" : "hover:bg-secondary",
													)}
												>
													<Icon className="size-4 shrink-0 text-muted-foreground" />
													<span className="min-w-0 flex-1">
														<span className="block truncate text-sm font-medium text-foreground">{tool.name}</span>
														<span className="block truncate text-xs text-muted-foreground">{tool.description}</span>
													</span>
												</Link>
											) : (
												<div className="flex items-center gap-3 rounded-md px-3 py-2.5 opacity-60">
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
										</div>
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
