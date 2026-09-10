"use client";

import { useMemo, useState } from "react";
import { Clock, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { ToolToolbar } from "@/components/tools/shared/ToolToolbar";
import { describeCronExpression } from "@/lib/tools/cron/describe";
import { FIELD_LABELS, FIELD_ORDER, validateCronExpression } from "@/lib/tools/cron/fields";
import { CRON_PRESETS, DEFAULT_CRON_EXPRESSION, toCronString } from "@/lib/tools/cron/generator";
import type { CronExpression, CronFieldName } from "@/lib/tools/cron/types";
import { cn } from "@/lib/utils";

const selectClasses =
	"rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CronGenerator() {
	const [expression, setExpression] = useState<CronExpression>(DEFAULT_CRON_EXPRESSION);

	const errors = useMemo(() => validateCronExpression(expression), [expression]);
	const isValid = errors.length === 0;
	const cronString = useMemo(() => toCronString(expression), [expression]);
	const explanation = useMemo(() => (isValid ? describeCronExpression(expression) : null), [isValid, expression]);

	function updateField(field: CronFieldName, value: string) {
		setExpression(previous => ({ ...previous, [field]: value }));
	}

	function applyPreset(label: string) {
		const preset = CRON_PRESETS.find(item => item.label === label);
		if (preset) setExpression(preset.expression);
	}

	function reset() {
		setExpression(DEFAULT_CRON_EXPRESSION);
	}

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<ToolToolbar className="justify-between">
					<label className="flex items-center gap-2 text-sm text-muted-foreground">
						<Sparkles className="size-4" />
						Preset
						<select onChange={event => applyPreset(event.target.value)} defaultValue="" className={selectClasses} aria-label="Cron schedule preset">
							<option value="" disabled>
								Choose a preset…
							</option>
							{CRON_PRESETS.map(preset => (
								<option key={preset.label} value={preset.label}>
									{preset.label}
								</option>
							))}
						</select>
					</label>

					<Button onClick={reset} variant="ghost" size="sm" className="text-destructive hover:bg-destructive-muted">
						<Trash2 className="size-3.5" />
						Reset
					</Button>
				</ToolToolbar>
			</div>

			<ToolPanel title="Schedule builder" icon={Clock}>
				<div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
					{FIELD_ORDER.map(field => {
						const fieldError = errors.find(error => error.field === field);

						return (
							<div key={field}>
								<label className="block text-xs font-medium text-muted-foreground" htmlFor={`cron-field-${field}`}>
									{FIELD_LABELS[field]}
								</label>
								<input
									id={`cron-field-${field}`}
									value={expression[field]}
									onChange={event => updateField(field, event.target.value)}
									spellCheck={false}
									className={cn(
										"mt-1 w-full rounded-md border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										fieldError ? "border-destructive-border" : "border-border",
									)}
									aria-invalid={Boolean(fieldError)}
									aria-describedby={fieldError ? `cron-field-${field}-error` : undefined}
								/>
							</div>
						);
					})}
				</div>
			</ToolPanel>

			{errors.length > 0 && (
				<ToolAlert variant="error" title="Invalid cron expression">
					<ul className="list-inside list-disc space-y-0.5">
						{errors.map(error => (
							<li key={error.field} id={`cron-field-${error.field}-error`}>
								{error.message}
							</li>
						))}
					</ul>
				</ToolAlert>
			)}

			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
					<span className="text-sm font-medium">Cron expression</span>
					<CopyButton value={cronString} ariaLabel="Copy cron expression" />
				</div>
				<div className="px-4 py-4">
					<code className="block font-mono text-lg font-semibold text-foreground">{cronString}</code>

					{explanation && <p className="mt-3 text-sm text-muted-foreground">{explanation}</p>}
				</div>
			</div>
		</div>
	);
}
