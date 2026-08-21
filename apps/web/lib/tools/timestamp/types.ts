export type TimestampUnit = "seconds" | "milliseconds" | "microseconds" | "nanoseconds";

export type InputType = "auto" | "unix-seconds" | "unix-milliseconds" | "iso" | "datetime";

/** What the detector/parser actually determined the raw input to be — a superset of InputType that also covers unit precision beyond seconds/milliseconds and the failure case. */
export type DetectedKind = "unix-seconds" | "unix-milliseconds" | "unix-microseconds" | "unix-nanoseconds" | "iso" | "datetime" | "invalid";

export type RelativeDirection = "past" | "present" | "future";

/** Rich, ready-to-render conversion of one resolved instant. Large integer values are kept as strings since precision matters more than arithmetic convenience once displayed. */
export interface TimestampResult {
	unixSeconds: string;
	unixMilliseconds: string;
	iso: string;
	utc: string;
	local: string;
	timezone: string;
	relative: string;
}

export interface RelativeTimeInfo {
	label: string;
	direction: RelativeDirection;
}

/** The full "debugging" view of one input — everything the Inspector panel needs, in one place. */
export interface TimestampInspection {
	valid: boolean;
	error?: string;
	detectedKind: DetectedKind;
	unit?: TimestampUnit;
	/** The resolved instant in epoch milliseconds — always a safe integer once `valid` is true. */
	epochMs?: number;
	result?: TimestampResult;
	relativeDirection?: RelativeDirection;
}

export interface TimezoneComparisonRow {
	timezone: string;
	label: string;
	offsetLabel: string;
	time: string;
}
