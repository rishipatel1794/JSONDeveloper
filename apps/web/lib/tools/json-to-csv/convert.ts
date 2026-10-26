import { isPlainObject } from "@/lib/tools/json-validator/utils";
import type { JsonValue } from "@/lib/tools/json-validator/types";

export interface ConvertOptions {
	delimiter: string;
}

export interface ConvertSuccess {
	success: true;
	csv: string;
	columns: string[];
}

export interface ConvertFailure {
	success: false;
	error: string;
}

/** Flattens one row's nested objects to dot-notation keys (e.g. address.city); arrays are kept as a single JSON-stringified cell rather than exploded into more rows. */
function flattenRow(value: Record<string, JsonValue>, prefix = ""): Record<string, JsonValue> {
	const result: Record<string, JsonValue> = {};

	for (const [key, cellValue] of Object.entries(value)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (isPlainObject(cellValue)) {
			Object.assign(result, flattenRow(cellValue, fullKey));
		} else {
			result[fullKey] = cellValue;
		}
	}

	return result;
}

function formatCell(value: JsonValue | undefined, delimiter: string): string {
	if (value === undefined || value === null) return "";

	const text = Array.isArray(value) ? JSON.stringify(value) : typeof value === "object" ? JSON.stringify(value) : String(value);

	if (text.includes(delimiter) || text.includes('"') || text.includes("\n") || text.includes("\r")) {
		return `"${text.replace(/"/g, '""')}"`;
	}

	return text;
}

/** Converts a JSON array of objects into CSV text. The root must be a non-empty array of objects — anything else is reported as an error, never silently coerced. */
export function jsonToCsv(value: JsonValue, options: ConvertOptions): ConvertSuccess | ConvertFailure {
	const { delimiter } = options;

	if (!Array.isArray(value)) {
		return { success: false, error: "JSON to CSV needs an array at the root — each item becomes one row." };
	}

	if (value.length === 0) {
		return { success: false, error: "The array is empty — there's nothing to convert." };
	}

	if (!value.every(isPlainObject)) {
		return { success: false, error: "Every item in the array must be an object — CSV columns come from object keys." };
	}

	const flattenedRows = value.map(item => flattenRow(item as Record<string, JsonValue>));

	const columns: string[] = [];
	const seen = new Set<string>();
	for (const row of flattenedRows) {
		for (const key of Object.keys(row)) {
			if (!seen.has(key)) {
				seen.add(key);
				columns.push(key);
			}
		}
	}

	const headerLine = columns.map(column => formatCell(column, delimiter)).join(delimiter);
	const dataLines = flattenedRows.map(row => columns.map(column => formatCell(row[column], delimiter)).join(delimiter));

	return { success: true, csv: [headerLine, ...dataLines].join("\r\n"), columns };
}
