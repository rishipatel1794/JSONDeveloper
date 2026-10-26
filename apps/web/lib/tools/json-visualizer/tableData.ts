import { isPlainObject } from "@/lib/tools/json-validator/utils";
import type { JsonValue } from "@/lib/tools/json-validator/types";

export interface TableRow {
	path: string;
	cells: Record<string, JsonValue | undefined>;
}

export interface TableData {
	columns: string[];
	rows: TableRow[];
	/** False when the array wasn't all objects — rows then have a single synthetic "value" column. */
	isObjectArray: boolean;
}

/** Builds a table from an array value; returns null for anything else (the caller should fall back to another view). */
export function buildTableData(value: JsonValue, basePath = ""): TableData | null {
	if (!Array.isArray(value) || value.length === 0) return null;

	const allObjects = value.every(isPlainObject);

	if (!allObjects) {
		return {
			columns: ["value"],
			rows: value.map((item, index) => ({ path: `${basePath}[${index}]`, cells: { value: item } })),
			isObjectArray: false,
		};
	}

	const columns: string[] = [];
	const seen = new Set<string>();
	for (const item of value) {
		for (const key of Object.keys(item as Record<string, JsonValue>)) {
			if (!seen.has(key)) {
				seen.add(key);
				columns.push(key);
			}
		}
	}

	const rows: TableRow[] = value.map((item, index) => ({
		path: `${basePath}[${index}]`,
		cells: item as Record<string, JsonValue>,
	}));

	return { columns, rows, isObjectArray: true };
}

export function formatCellValue(value: JsonValue | undefined): string {
	if (value === undefined) return "";
	if (value === null) return "null";
	if (Array.isArray(value)) return `[${value.length}]`;
	if (typeof value === "object") return `{${Object.keys(value).length}}`;
	return String(value);
}
