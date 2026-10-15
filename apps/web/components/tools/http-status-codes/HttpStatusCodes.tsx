"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { STATUS_CODES } from "@/lib/tools/http-status-codes/data";
import { filterByCategory, searchStatusCodes } from "@/lib/tools/http-status-codes/search";
import { CATEGORY_LABELS, type StatusCategory } from "@/lib/tools/http-status-codes/types";

import { StatusCodeCard } from "./StatusCodeCard";

const CATEGORY_OPTIONS: Array<{ value: StatusCategory | "all"; label: string }> = [
	{ value: "all", label: "All" },
	{ value: "informational", label: CATEGORY_LABELS.informational },
	{ value: "success", label: CATEGORY_LABELS.success },
	{ value: "redirection", label: CATEGORY_LABELS.redirection },
	{ value: "client-error", label: CATEGORY_LABELS["client-error"] },
	{ value: "server-error", label: CATEGORY_LABELS["server-error"] },
];

export function HttpStatusCodes() {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<StatusCategory | "all">("all");
	const [expandedCode, setExpandedCode] = useState<number | null>(null);

	// Deep-link support: a URL like /http-status-codes#status-404 opens directly to that code's detail,
	// matching the "share a status-code detail URL" requirement without needing a dynamic server route.
	useEffect(() => {
		const hash = window.location.hash;
		const match = /^#status-(\d+)$/.exec(hash);
		if (!match) return;

		const code = Number(match[1]);
		setExpandedCode(code);
		requestAnimationFrame(() => {
			document.getElementById(`status-${code}`)?.scrollIntoView({ block: "center" });
		});
	}, []);

	const results = useMemo(() => {
		const byCategory = filterByCategory(STATUS_CODES, category);
		return searchStatusCodes(byCategory, query);
	}, [query, category]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						value={query}
						onChange={event => setQuery(event.target.value)}
						placeholder="Search by code, name, or keyword — e.g. 404, unauthorized, rate limit"
						aria-label="Search HTTP status codes"
						className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</div>
			</div>

			<div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
				{CATEGORY_OPTIONS.map(option => (
					<button
						key={option.value}
						type="button"
						onClick={() => setCategory(option.value)}
						aria-pressed={category === option.value}
						className={cn(
							"rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
							category === option.value ? "border-primary/50 bg-elevated text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary",
						)}
					>
						{option.label}
					</button>
				))}
			</div>

			<p className="text-xs text-subtle-foreground">
				{results.length} {results.length === 1 ? "code" : "codes"}
			</p>

			{results.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
					<p className="text-sm font-medium text-foreground">No status codes match your search</p>
					<p className="mt-1 text-sm text-muted-foreground">Try a different code, name, or keyword.</p>
				</div>
			) : (
				<div className="space-y-2">
					{results.map(statusCode => (
						<StatusCodeCard
							key={statusCode.code}
							statusCode={statusCode}
							expanded={expandedCode === statusCode.code}
							onToggle={() => setExpandedCode(current => (current === statusCode.code ? null : statusCode.code))}
						/>
					))}
				</div>
			)}
		</div>
	);
}
