export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface SourceLocation {
	line: number;
	column: number;
	position: number;
}

export interface ContextLine {
	lineNumber: number;
	text: string;
	isErrorLine: boolean;
}

export interface JsonSyntaxError {
	/** Raw parser message — precise but terse, e.g. "Unexpected token '}'". */
	message: string;
	/** Developer-friendly explanation, e.g. "Trailing comma detected. JSON does not allow a comma after the final property." */
	friendlyMessage: string;
	line: number;
	column: number;
	position: number;
}

export interface DuplicateKeyOccurrence {
	key: string;
	/** Dot/bracket path to the object containing this key — "" for the root object. */
	path: string;
	locations: SourceLocation[];
}

export interface JsonStatistics {
	objects: number;
	arrays: number;
	keys: number;
	strings: number;
	numbers: number;
	booleans: number;
	nulls: number;
	totalNodes: number;
	maxDepth: number;
	sizeBytes: number;
}

export interface JsonValidationResult {
	valid: boolean;
	error?: JsonSyntaxError;
	contextLines?: ContextLine[];
	value?: JsonValue;
	statistics?: JsonStatistics;
	duplicates: DuplicateKeyOccurrence[];
	/** Set when the input was too large to run the full diagnostic parser / duplicate-key scan. */
	limitedAnalysis: boolean;
}

export interface JsonTreeNode {
	key: string;
	/** Dot/bracket path from the root, e.g. "user.roles[0]". */
	path: string;
	type: "object" | "array" | "string" | "number" | "boolean" | "null";
	value: JsonValue;
	children: JsonTreeNode[];
	depth: number;
}

export type SchemaIssueKeyword =
	| "type"
	| "required"
	| "enum"
	| "const"
	| "minimum"
	| "maximum"
	| "exclusiveMinimum"
	| "exclusiveMaximum"
	| "multipleOf"
	| "minLength"
	| "maxLength"
	| "pattern"
	| "minItems"
	| "maxItems"
	| "uniqueItems"
	| "additionalProperties"
	| "oneOf"
	| "anyOf"
	| "allOf"
	| "not"
	| "format";

export interface SchemaValidationIssue {
	/** Dot/bracket path into the JSON instance, "" for the root value. */
	path: string;
	keyword: SchemaIssueKeyword;
	message: string;
	expected?: string;
	received?: string;
}

export interface SchemaValidationResult {
	valid: boolean;
	issues: SchemaValidationIssue[];
	error?: string;
}
