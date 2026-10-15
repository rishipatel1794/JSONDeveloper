"use client";

import { ChevronDown, Link2 } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { buildFrameworkExamples } from "@/lib/tools/http-status-codes/codeExamples";
import { getStatusCode } from "@/lib/tools/http-status-codes/data";
import type { StatusCode } from "@/lib/tools/http-status-codes/types";
import { cn } from "@/lib/utils";

import { StatusCategoryBadge } from "./StatusCategoryBadge";

interface StatusCodeCardProps {
	statusCode: StatusCode;
	expanded: boolean;
	onToggle: () => void;
}

export function StatusCodeCard({ statusCode, expanded, onToggle }: StatusCodeCardProps) {
	const frameworkExamples = buildFrameworkExamples(statusCode);
	const related = (statusCode.relatedCodes ?? []).map(getStatusCode).filter((entry): entry is StatusCode => Boolean(entry));

	function handleCopyLink() {
		const url = `${window.location.origin}${window.location.pathname}#status-${statusCode.code}`;
		void navigator.clipboard.writeText(url);
	}

	return (
		<div id={`status-${statusCode.code}`} className="scroll-mt-20 rounded-xl border border-border bg-card shadow-sm">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={expanded}
				aria-controls={`status-${statusCode.code}-detail`}
				className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-secondary"
			>
				<span className="w-14 shrink-0 font-mono text-lg font-bold text-foreground">{statusCode.code}</span>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold text-foreground">
						{statusCode.title}
						{!statusCode.standardStatus && <span className="ml-2 text-xs font-normal text-subtle-foreground">(non-standard)</span>}
					</p>
					<p className="truncate text-xs text-muted-foreground">{statusCode.description}</p>
				</div>
				<StatusCategoryBadge category={statusCode.category} />
				<ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
			</button>

			{expanded && (
				<div id={`status-${statusCode.code}-detail`} className="space-y-4 border-t border-border px-4 py-4">
					<div className="flex flex-wrap items-center justify-end gap-2">
						<CopyButton value={String(statusCode.code)} label="Copy code" />
						<CopyButton value={statusCode.title} label="Copy name" />
						<button
							type="button"
							onClick={handleCopyLink}
							className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
						>
							<Link2 className="size-3.5" />
							Copy link
						</button>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">When to use it</p>
						<p className="mt-1 text-sm text-muted-foreground">{statusCode.whenToUse}</p>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Common causes</p>
						<ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
							{statusCode.commonCauses.map(cause => (
								<li key={cause}>{cause}</li>
							))}
						</ul>
					</div>

					{statusCode.apiExample && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">API example</p>
							<pre className="mt-1 overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs text-foreground">
								{JSON.stringify(statusCode.apiExample, null, 2)}
							</pre>
						</div>
					)}

					{frameworkExamples.length > 0 && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Framework examples</p>
							<div className="mt-1 grid gap-3 md:grid-cols-3">
								{frameworkExamples.map(example => (
									<div key={example.platform} className="rounded-lg border border-border-subtle">
										<div className="flex items-center justify-between border-b border-border-subtle px-2.5 py-1.5">
											<span className="text-xs font-medium text-muted-foreground">{example.platform}</span>
											<CopyButton value={example.code} />
										</div>
										<pre className="overflow-x-auto p-2.5 font-mono text-[11px] leading-relaxed text-foreground">{example.code}</pre>
									</div>
								))}
							</div>
						</div>
					)}

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Developer tip</p>
						<p className="mt-1 text-sm text-muted-foreground">{statusCode.developerTip}</p>
					</div>

					{related.length > 0 && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Related status codes</p>
							<div className="mt-1.5 flex flex-wrap gap-1.5">
								{related.map(entry => (
									<a
										key={entry.code}
										href={`#status-${entry.code}`}
										className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-xs text-foreground hover:bg-elevated"
									>
										{entry.code} {entry.title}
									</a>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
