interface DateTimeInputProps {
	date: string;
	onDateChange: (value: string) => void;
	time: string;
	onTimeChange: (value: string) => void;
}

/** Mode B ("Date → Timestamp") input fields. Native date/time inputs — keyboard-accessible, no extra UI dependency needed. */
export function DateTimeInput({ date, onDateChange, time, onTimeChange }: DateTimeInputProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<div>
				<label htmlFor="timestamp-date" className="mb-1.5 block text-sm font-medium text-foreground">
					Date
				</label>
				<input
					id="timestamp-date"
					type="date"
					value={date}
					onChange={event => onDateChange(event.target.value)}
					className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>

			<div>
				<label htmlFor="timestamp-time" className="mb-1.5 block text-sm font-medium text-foreground">
					Time
				</label>
				<input
					id="timestamp-time"
					type="time"
					step="0.001"
					value={time}
					onChange={event => onTimeChange(event.target.value)}
					className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>
		</div>
	);
}
