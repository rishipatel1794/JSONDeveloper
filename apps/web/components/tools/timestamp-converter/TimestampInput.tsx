import { Clock } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { InputType } from "@/lib/tools/timestamp/types";

const INPUT_TYPES: { value: InputType; label: string }[] = [
	{ value: "auto", label: "Auto Detect" },
	{ value: "unix-seconds", label: "Unix Seconds" },
	{ value: "unix-milliseconds", label: "Unix Milliseconds" },
	{ value: "iso", label: "ISO 8601" },
	{ value: "datetime", label: "Date & Time" },
];

interface TimestampInputProps {
	value: string;
	onChange: (value: string) => void;
	inputType: InputType;
	onInputTypeChange: (type: InputType) => void;
	onNow: () => void;
	/** Fired on blur/Enter — used to record a settled value into recent history, not on every keystroke. */
	onCommit?: () => void;
}

export function TimestampInput({ value, onChange, inputType, onInputTypeChange, onNow, onCommit }: TimestampInputProps) {
	return (
		<div className="space-y-3">
			<div>
				<label htmlFor="timestamp-input" className="mb-1.5 block text-sm font-medium text-foreground">
					Timestamp
				</label>
				<div className="flex gap-2">
					<input
						id="timestamp-input"
						type="text"
						inputMode="text"
						spellCheck={false}
						value={value}
						onChange={event => onChange(event.target.value)}
						onBlur={onCommit}
						onKeyDown={event => {
							if (event.key === "Enter") onCommit?.();
						}}
						placeholder="1755000000, 1755000000000, or 2026-08-12T12:30:00Z"
						className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
					<Button onClick={onNow} variant="outline" size="md">
						<Clock className="size-4" />
						Now
					</Button>
				</div>
			</div>

			<label className="inline-flex items-center gap-2">
				<span className="text-xs font-medium text-muted-foreground">Input Type</span>
				<select
					value={inputType}
					onChange={event => onInputTypeChange(event.target.value as InputType)}
					className="h-9 rounded-md border border-border bg-card px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					{INPUT_TYPES.map(type => (
						<option key={type.value} value={type.value}>
							{type.label}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}
