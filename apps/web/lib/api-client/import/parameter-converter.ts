import { isPlainObject } from "./openapi-parser";
import { generateSchemaExample } from "./schema-generator";
import type { ImportedParameter, ImportedParamLocation } from "./types";

function stringifyExampleValue(value: unknown): string {
	if (typeof value === "string") return value;
	if (value === null || value === undefined) return "";
	return JSON.stringify(value);
}

function resolveParameterValue(param: Record<string, unknown>): string {
	if (param.example !== undefined) return stringifyExampleValue(param.example);

	if (isPlainObject(param.examples)) {
		const first = Object.values(param.examples)[0];
		if (isPlainObject(first) && "value" in first) return stringifyExampleValue(first.value);
	}

	// OpenAPI 3 nests type info under `schema`; Swagger 2 puts it directly on the parameter object.
	const schema = isPlainObject(param.schema) ? param.schema : param;

	if (schema.example !== undefined) return stringifyExampleValue(schema.example);
	if (schema.default !== undefined) return stringifyExampleValue(schema.default);
	if (Array.isArray(schema.enum) && schema.enum.length > 0) return stringifyExampleValue(schema.enum[0]);

	const generated = generateSchemaExample(schema);
	if (generated !== null && generated !== undefined) return stringifyExampleValue(generated);

	return "";
}

const SUPPORTED_LOCATIONS: ImportedParamLocation[] = ["path", "query", "header"];

/** Converts an operation's `parameters` array — cookie params are skipped (not modeled by our request builder). */
export function convertParameters(parameters: unknown): ImportedParameter[] {
	if (!Array.isArray(parameters)) return [];

	const result: ImportedParameter[] = [];

	for (const raw of parameters) {
		if (!isPlainObject(raw)) continue;

		const name = typeof raw.name === "string" ? raw.name : undefined;
		const location = raw.in;
		if (!name || !SUPPORTED_LOCATIONS.includes(location as ImportedParamLocation)) continue;

		result.push({
			name,
			in: location as ImportedParamLocation,
			required: location === "path" ? true : Boolean(raw.required),
			value: resolveParameterValue(raw),
			description: typeof raw.description === "string" ? raw.description : undefined,
		});
	}

	return result;
}
