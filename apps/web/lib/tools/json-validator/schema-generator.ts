import type { JsonValue } from "./types";
import { deepEqualJson } from "./utils";

const JSON_SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";

type SchemaNode = Record<string, unknown>;

function dedupeSchemas(schemas: SchemaNode[]): SchemaNode[] {
	const unique: SchemaNode[] = [];
	for (const schema of schemas) {
		if (!unique.some(existing => deepEqualJson(existing as unknown as JsonValue, schema as unknown as JsonValue))) {
			unique.push(schema);
		}
	}
	return unique;
}

function inferNode(value: JsonValue): SchemaNode {
	if (value === null) return { type: "null" };
	if (typeof value === "boolean") return { type: "boolean" };
	if (typeof value === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
	if (typeof value === "string") return { type: "string" };

	if (Array.isArray(value)) {
		if (value.length === 0) return { type: "array", items: {} };
		const itemSchemas = dedupeSchemas(value.map(inferNode));
		return { type: "array", items: itemSchemas.length === 1 ? itemSchemas[0] : { anyOf: itemSchemas } };
	}

	const properties: Record<string, unknown> = {};
	const required: string[] = [];
	for (const [key, childValue] of Object.entries(value)) {
		properties[key] = inferNode(childValue);
		required.push(key);
	}

	const schema: SchemaNode = { type: "object", properties };
	if (required.length > 0) schema.required = required;
	return schema;
}

/** Generates a JSON Schema (Draft 2020-12) document describing the shape of a sample JSON value. Purely local/deterministic. */
export function generateJsonSchema(value: JsonValue): Record<string, unknown> {
	return { $schema: JSON_SCHEMA_DIALECT, ...inferNode(value) };
}

export function generateJsonSchemaText(value: JsonValue): string {
	return JSON.stringify(generateJsonSchema(value), null, 2);
}
