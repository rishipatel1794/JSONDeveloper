export interface CronExpression {
	minute: string;
	hour: string;
	dayOfMonth: string;
	month: string;
	dayOfWeek: string;
}

export type CronFieldName = keyof CronExpression;

export interface CronFieldRange {
	min: number;
	max: number;
}

export interface CronValidationError {
	field: CronFieldName;
	message: string;
}

export interface CronParseResult {
	valid: boolean;
	expression?: CronExpression;
	errors: CronValidationError[];
}

export interface CronPreset {
	label: string;
	expression: CronExpression;
}
