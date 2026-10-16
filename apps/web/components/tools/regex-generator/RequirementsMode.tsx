"use client";

import { useEffect, useState } from "react";

import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { buildFromRequirements } from "@/lib/tools/regex-generator/requirementsBuilder";
import type { RequirementsOptions } from "@/lib/tools/regex-generator/types";

interface RequirementsModeProps {
	onApply: (pattern: string) => void;
}

const inputClass =
	"w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
	return (
		<label className="flex items-center gap-2 text-sm text-foreground">
			<input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="size-4 rounded border-border" />
			{label}
		</label>
	);
}

export function RequirementsMode({ onApply }: RequirementsModeProps) {
	const [options, setOptions] = useState<RequirementsOptions>({});
	const [warnings, setWarnings] = useState<string[]>([]);

	useEffect(() => {
		const { pattern, warnings: nextWarnings } = buildFromRequirements(options);
		setWarnings(nextWarnings);
		onApply(pattern);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- onApply is a stable setter from the parent, including it would re-run this on every parent render
	}, [options]);

	function update<K extends keyof RequirementsOptions>(key: K, value: RequirementsOptions[K]) {
		setOptions(current => ({ ...current, [key]: value || undefined }));
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Minimum length</label>
					<input
						type="number"
						min={0}
						className={inputClass}
						onChange={event => update("minLength", event.target.value ? Number(event.target.value) : undefined)}
					/>
				</div>
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Maximum length</label>
					<input
						type="number"
						min={0}
						className={inputClass}
						onChange={event => update("maxLength", event.target.value ? Number(event.target.value) : undefined)}
					/>
				</div>
			</div>

			<div className="grid gap-2 sm:grid-cols-2">
				<CheckboxRow label="Must contain uppercase letters" checked={!!options.requireUppercase} onChange={value => update("requireUppercase", value)} />
				<CheckboxRow label="Must contain lowercase letters" checked={!!options.requireLowercase} onChange={value => update("requireLowercase", value)} />
				<CheckboxRow label="Must contain numbers" checked={!!options.requireNumber} onChange={value => update("requireNumber", value)} />
				<CheckboxRow label="Must contain special characters" checked={!!options.requireSpecial} onChange={value => update("requireSpecial", value)} />
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Must start with</label>
					<input type="text" placeholder="e.g. ID-" className={inputClass} onChange={event => update("startsWith", event.target.value)} />
				</div>
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Must end with</label>
					<input type="text" placeholder="e.g. -X" className={inputClass} onChange={event => update("endsWith", event.target.value)} />
				</div>
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Allowed characters</label>
					<input type="text" placeholder="e.g. abcABC0123-_" className={inputClass} onChange={event => update("allowedChars", event.target.value)} />
				</div>
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Forbidden characters</label>
					<input type="text" placeholder="e.g. <>&" className={inputClass} onChange={event => update("forbiddenChars", event.target.value)} />
				</div>
			</div>

			{warnings.length > 0 && (
				<ToolAlert variant="warning" title="This combination may be ambiguous or contradictory">
					<ul className="list-inside list-disc space-y-0.5">
						{warnings.map(warning => (
							<li key={warning}>{warning}</li>
						))}
					</ul>
				</ToolAlert>
			)}
		</div>
	);
}
