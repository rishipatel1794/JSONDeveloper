"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { REGEX_TEMPLATES } from "@/lib/tools/regex-generator/templates";
import { cn } from "@/lib/utils";

interface TemplateModeProps {
	onApply: (pattern: string, flags: string) => void;
}

export function TemplateMode({ onApply }: TemplateModeProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [usePractical, setUsePractical] = useState(false);

	const selected = REGEX_TEMPLATES.find(template => template.id === selectedId) ?? null;

	function selectTemplate(id: string) {
		setSelectedId(id);
		setUsePractical(false);
		const template = REGEX_TEMPLATES.find(t => t.id === id);
		if (template) onApply(template.pattern, template.flags);
	}

	function toggleVariant(practical: boolean) {
		setUsePractical(practical);
		if (!selected) return;
		const pattern = practical && selected.practicalVariant ? selected.practicalVariant.pattern : selected.pattern;
		onApply(pattern, selected.flags);
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
				{REGEX_TEMPLATES.map(template => (
					<button
						key={template.id}
						type="button"
						onClick={() => selectTemplate(template.id)}
						className={cn(
							"rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors",
							selectedId === template.id ? "border-primary/50 bg-elevated text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
						)}
					>
						{template.label}
					</button>
				))}
			</div>

			{selected && (
				<div className="space-y-3 rounded-xl border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">{selected.description}</p>

					{selected.practicalVariant && (
						<div className="flex items-center gap-2">
							<Button variant={usePractical ? "outline" : "primary"} size="sm" onClick={() => toggleVariant(false)}>
								Strict
							</Button>
							<Button variant={usePractical ? "primary" : "outline"} size="sm" onClick={() => toggleVariant(true)}>
								Practical
							</Button>
							<p className="text-xs text-subtle-foreground">{usePractical ? selected.practicalVariant.description : "The default, more thorough pattern."}</p>
						</div>
					)}

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">What this does not guarantee</p>
						<ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
							{selected.limitations.map(limitation => (
								<li key={limitation}>{limitation}</li>
							))}
						</ul>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Matches</p>
							<ul className="mt-1 space-y-0.5 font-mono text-xs text-success">
								{selected.examplesMatch.map(example => (
									<li key={example}>{example}</li>
								))}
							</ul>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Does not match</p>
							<ul className="mt-1 space-y-0.5 font-mono text-xs text-destructive">
								{selected.examplesNoMatch.map(example => (
									<li key={example}>{example}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
