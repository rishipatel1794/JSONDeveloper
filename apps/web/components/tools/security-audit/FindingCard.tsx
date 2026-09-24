"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import type { Finding } from "@/lib/security-audit/types";
import { cn } from "@/lib/utils";

import { SEVERITY_STYLES } from "./severity";

interface FindingCardProps {
	finding: Finding;
	defaultOpen?: boolean;
}

export function FindingCard({ finding, defaultOpen = false }: FindingCardProps) {
	const [open, setOpen] = useState(defaultOpen);
	const panelId = useId();
	const style = SEVERITY_STYLES[finding.severity];
	const Icon = style.icon;

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card">
			<button
				type="button"
				onClick={() => setOpen(value => !value)}
				aria-expanded={open}
				aria-controls={panelId}
				className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
			>
				<div className="flex min-w-0 items-center gap-3">
					<Icon className={cn("size-4 shrink-0", style.iconClass)} />
					<span className="truncate text-sm font-medium text-foreground">{finding.title}</span>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<span className={cn("rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide", style.badgeClass)}>{style.label}</span>
					<ChevronDown className={cn("size-4 text-subtle-foreground transition-transform", open && "rotate-180")} />
				</div>
			</button>

			{open && (
				<div id={panelId} className="space-y-4 border-t border-border-subtle px-4 py-4 text-sm">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">What we found</p>
						<p className="mt-1 leading-relaxed text-muted-foreground">{finding.description}</p>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Why it matters</p>
						<p className="mt-1 leading-relaxed text-muted-foreground">{finding.impact}</p>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Recommendation</p>
						<p className="mt-1 leading-relaxed text-muted-foreground">{finding.recommendation}</p>
					</div>

					{Object.keys(finding.evidence).length > 0 && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Evidence</p>
							<pre className="mt-1 overflow-x-auto rounded-md bg-secondary p-3 font-mono text-xs text-muted-foreground">
								{JSON.stringify(finding.evidence, null, 2)}
							</pre>
						</div>
					)}

					{finding.fixes && finding.fixes.length > 0 && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Example configuration</p>
							<p className="mt-1 text-xs text-subtle-foreground">Examples — adapt to your application; not every policy suits every app.</p>
							<div className="mt-2 space-y-2">
								{finding.fixes.map(fix => (
									<div key={fix.platform} className="overflow-hidden rounded-md border border-border-subtle">
										<div className="flex items-center justify-between gap-2 bg-secondary px-3 py-1.5">
											<span className="text-xs font-medium text-foreground">{fix.platform}</span>
											<CopyButton value={fix.code} ariaLabel={`Copy ${fix.platform} example`} />
										</div>
										<pre className="overflow-x-auto bg-card p-3 font-mono text-xs text-muted-foreground">{fix.code}</pre>
									</div>
								))}
							</div>
						</div>
					)}

					{finding.references && finding.references.length > 0 && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">References</p>
							<ul className="mt-1 space-y-1">
								{finding.references.map(reference => (
									<li key={reference}>
										<a href={reference} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
											{reference}
										</a>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
