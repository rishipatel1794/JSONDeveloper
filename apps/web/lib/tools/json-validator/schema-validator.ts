import type { JsonValue, SchemaValidationIssue, SchemaValidationResult } from "./types";
import { deepEqualJson, getValueType, isPlainObject } from "./utils";

/**
 * A deliberately compact JSON Schema validator — covers the keywords developers actually reach for
 * (type, properties/required, enum/const, string/number/array bounds, pattern, oneOf/anyOf/allOf/not)
 * without pulling in a full Draft 2020-12 implementation. No dependency: this only needs to be
 * useful, not spec-complete. Unrecognized keywords are silently ignored rather than rejected.
 */

type SchemaNode = Record<string, unknown>;

function joinPath(path: string, segment: string): string {
	return path ? `${path}.${segment}` : segment;
}

function matchesType(value: JsonValue, type: string): boolean {
	switch (type) {
		case "object":
			return isPlainObject(value);
		case "array":
			return Array.isArray(value);
		case "string":
			return typeof value === "string";
		case "number":
			return typeof value === "number";
		case "integer":
			return typeof value === "number" && Number.isInteger(value);
		case "boolean":
			return typeof value === "boolean";
		case "null":
			return value === null;
		default:
			return true;
	}
}

function validateNode(value: JsonValue, schema: SchemaNode, path: string, issues: SchemaValidationIssue[]): void {
	if (typeof schema.type === "string") {
		if (!matchesType(value, schema.type)) {
			issues.push({
				path,
				keyword: "type",
				message: `Expected ${schema.type}, received ${getValueType(value)}.`,
				expected: schema.type,
				received: getValueType(value),
			});
			return;
		}
	} else if (Array.isArray(schema.type)) {
		const types = schema.type as string[];
		if (!types.some(type => matchesType(value, type))) {
			issues.push({
				path,
				keyword: "type",
				message: `Expected one of ${types.join(", ")}, received ${getValueType(value)}.`,
				expected: types.join(" | "),
				received: getValueType(value),
			});
			return;
		}
	}

	if (Array.isArray(schema.enum) && !schema.enum.some(option => deepEqualJson(option as JsonValue, value))) {
		issues.push({ path, keyword: "enum", message: "Value must be one of the schema's allowed enum values." });
	}

	if ("const" in schema && !deepEqualJson(schema.const as JsonValue, value)) {
		issues.push({ path, keyword: "const", message: "Value must equal the constant defined in the schema." });
	}

	if (typeof value === "string") validateString(value, schema, path, issues);
	if (typeof value === "number") validateNumber(value, schema, path, issues);
	if (Array.isArray(value)) validateArray(value, schema, path, issues);
	if (isPlainObject(value)) validateObject(value, schema, path, issues);

	validateCombinators(value, schema, path, issues);
}

function validateString(value: string, schema: SchemaNode, path: string, issues: SchemaValidationIssue[]): void {
	if (typeof schema.minLength === "number" && value.length < schema.minLength) {
		issues.push({ path, keyword: "minLength", message: `String must be at least ${schema.minLength} character(s).` });
	}
	if (typeof schema.maxLength === "number" && value.length > schema.maxLength) {
		issues.push({ path, keyword: "maxLength", message: `String must be at most ${schema.maxLength} character(s).` });
	}
	if (typeof schema.pattern === "string") {
		try {
			if (!new RegExp(schema.pattern).test(value)) {
				issues.push({ path, keyword: "pattern", message: `String does not match pattern /${schema.pattern}/.` });
			}
		} catch {
			// An invalid regex in the schema itself shouldn't crash validation — just skip this check.
		}
	}
}

function validateNumber(value: number, schema: SchemaNode, path: string, issues: SchemaValidationIssue[]): void {
	if (typeof schema.minimum === "number" && value < schema.minimum) issues.push({ path, keyword: "minimum", message: `Must be >= ${schema.minimum}.` });
	if (typeof schema.maximum === "number" && value > schema.maximum) issues.push({ path, keyword: "maximum", message: `Must be <= ${schema.maximum}.` });
	if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) {
		issues.push({ path, keyword: "exclusiveMinimum", message: `Must be > ${schema.exclusiveMinimum}.` });
	}
	if (typeof schema.exclusiveMaximum === "number" && value >= schema.exclusiveMaximum) {
		issues.push({ path, keyword: "exclusiveMaximum", message: `Must be < ${schema.exclusiveMaximum}.` });
	}
	if (typeof schema.multipleOf === "number" && schema.multipleOf > 0 && !Number.isInteger(value / schema.multipleOf)) {
		issues.push({ path, keyword: "multipleOf", message: `Must be a multiple of ${schema.multipleOf}.` });
	}
}

function validateArray(value: JsonValue[], schema: SchemaNode, path: string, issues: SchemaValidationIssue[]): void {
	if (typeof schema.minItems === "number" && value.length < schema.minItems) {
		issues.push({ path, keyword: "minItems", message: `Array must have at least ${schema.minItems} item(s).` });
	}
	if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
		issues.push({ path, keyword: "maxItems", message: `Array must have at most ${schema.maxItems} item(s).` });
	}
	if (schema.uniqueItems === true) {
		const seen: JsonValue[] = [];
		const hasDuplicate = value.some(item => {
			const isDuplicate = seen.some(existing => deepEqualJson(existing, item));
			seen.push(item);
			return isDuplicate;
		});
		if (hasDuplicate) issues.push({ path, keyword: "uniqueItems", message: "Array items must be unique." });
	}

	const tuple = Array.isArray(schema.prefixItems) ? (schema.prefixItems as unknown[]) : Array.isArray(schema.items) ? (schema.items as unknown[]) : undefined;

	if (tuple) {
		value.forEach((item, index) => {
			const itemSchema = tuple[index];
			if (isPlainObject(itemSchema)) validateNode(item, itemSchema as SchemaNode, `${path}[${index}]`, issues);
		});
		const rest = schema.items && !Array.isArray(schema.items) ? schema.items : undefined;
		if (isPlainObject(rest)) {
			value.slice(tuple.length).forEach((item, offset) => validateNode(item, rest as SchemaNode, `${path}[${tuple.length + offset}]`, issues));
		}
	} else if (isPlainObject(schema.items)) {
		value.forEach((item, index) => validateNode(item, schema.items as SchemaNode, `${path}[${index}]`, issues));
	}
}

function validateObject(value: Record<string, JsonValue>, schema: SchemaNode, path: string, issues: SchemaValidationIssue[]): void {
	const required = Array.isArray(schema.required) ? (schema.required as string[]) : [];
	for (const key of required) {
		if (!Object.prototype.hasOwnProperty.call(value, key)) {
			issues.push({ path: joinPath(path, key), keyword: "required", message: `Missing required property "${key}".` });
		}
	}

	const properties = isPlainObject(schema.properties) ? (schema.properties as Record<string, unknown>) : {};
	for (const [key, propertyValue] of Object.entries(value)) {
		const propertySchema = properties[key];
		if (isPlainObject(propertySchema)) {
			validateNode(propertyValue, propertySchema as SchemaNode, joinPath(path, key), issues);
		} else if (schema.additionalProperties === false) {
			issues.push({ path: joinPath(path, key), keyword: "additionalProperties", message: `Property "${key}" is not allowed by the schema.` });
		} else if (isPlainObject(schema.additionalProperties)) {
			validateNode(propertyValue, schema.additionalProperties as SchemaNode, joinPath(path, key), issues);
		}
	}
}

function validateCombinators(value: JsonValue, schema: SchemaNode, path: string, issues: SchemaValidationIssue[]): void {
	if (Array.isArray(schema.allOf)) {
		for (const sub of schema.allOf) if (isPlainObject(sub)) validateNode(value, sub as SchemaNode, path, issues);
	}

	if (Array.isArray(schema.anyOf)) {
		const results = (schema.anyOf as unknown[]).map(sub => {
			const subIssues: SchemaValidationIssue[] = [];
			if (isPlainObject(sub)) validateNode(value, sub as SchemaNode, path, subIssues);
			return subIssues;
		});
		if (!results.some(result => result.length === 0)) {
			issues.push({ path, keyword: "anyOf", message: `Value did not match any of the ${results.length} schema(s) in "anyOf".` });
		}
	}

	if (Array.isArray(schema.oneOf)) {
		const results = (schema.oneOf as unknown[]).map(sub => {
			const subIssues: SchemaValidationIssue[] = [];
			if (isPlainObject(sub)) validateNode(value, sub as SchemaNode, path, subIssues);
			return subIssues;
		});
		const matchCount = results.filter(result => result.length === 0).length;
		if (matchCount !== 1) {
			issues.push({ path, keyword: "oneOf", message: `Value must match exactly one of the ${results.length} schema(s) in "oneOf" (matched ${matchCount}).` });
		}
	}

	if (isPlainObject(schema.not)) {
		const subIssues: SchemaValidationIssue[] = [];
		validateNode(value, schema.not as SchemaNode, path, subIssues);
		if (subIssues.length === 0) issues.push({ path, keyword: "not", message: 'Value must not match the schema defined in "not".' });
	}
}

export function validateAgainstSchema(value: JsonValue, schema: JsonValue): SchemaValidationResult {
	if (schema === true) return { valid: true, issues: [] };
	if (schema === false) {
		return { valid: false, issues: [{ path: "", keyword: "type", message: "This schema rejects every value (schema is `false`)." }] };
	}
	if (!isPlainObject(schema)) {
		return { valid: false, issues: [], error: "A JSON Schema must be a JSON object (or the boolean `true`/`false`)." };
	}

	const issues: SchemaValidationIssue[] = [];
	validateNode(value, schema as SchemaNode, "", issues);
	return { valid: issues.length === 0, issues };
}
