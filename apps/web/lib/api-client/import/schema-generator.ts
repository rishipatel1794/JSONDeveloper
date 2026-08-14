import { isPlainObject } from "./openapi-parser";

const FORMAT_EXAMPLES: Record<string, string> = {
	"date-time": "2024-01-01T00:00:00Z",
	date: "2024-01-01",
	email: "user@example.com",
	uuid: "00000000-0000-0000-0000-000000000000",
	uri: "https://example.com",
	hostname: "example.com",
	ipv4: "192.0.2.1",
	ipv6: "::1",
};

/**
 * Generates a representative example value from a (already $ref-resolved) JSON Schema object,
 * preferring example/examples/default/enum over synthesizing one from the declared type. Never
 * invents anything credential-shaped — string fields just get the literal placeholder "string".
 */
export function generateSchemaExample(schema: unknown, depth = 0): unknown {
	if (depth > 12) return null;
	if (!isPlainObject(schema)) return null;

	if (schema.example !== undefined) return schema.example;

	if (Array.isArray(schema.examples) && schema.examples.length > 0) return schema.examples[0];
	if (isPlainObject(schema.examples)) {
		const first = Object.values(schema.examples)[0];
		if (isPlainObject(first) && "value" in first) return first.value;
	}

	if (schema.default !== undefined) return schema.default;
	if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];

	if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
		const properties: Record<string, unknown> = {};
		const required: string[] = [];
		let type = "object";

		for (const sub of schema.allOf) {
			if (!isPlainObject(sub)) continue;
			if (isPlainObject(sub.properties)) Object.assign(properties, sub.properties);
			if (Array.isArray(sub.required)) required.push(...sub.required.filter((item): item is string => typeof item === "string"));
			if (typeof sub.type === "string") type = sub.type;
		}

		return generateSchemaExample({ type, properties, required }, depth + 1);
	}

	if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) return generateSchemaExample(schema.oneOf[0], depth + 1);
	if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) return generateSchemaExample(schema.anyOf[0], depth + 1);

	const type = schema.type;

	if (type === "object" || (!type && isPlainObject(schema.properties))) {
		const properties = isPlainObject(schema.properties) ? schema.properties : {};
		const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === "string") : [];

		const result: Record<string, unknown> = {};
		for (const [key, propertySchema] of Object.entries(properties)) {
			result[key] = generateSchemaExample(propertySchema, depth + 1);
		}
		for (const key of required) {
			if (!(key in result)) result[key] = generateSchemaExample({}, depth + 1);
		}
		return result;
	}

	if (type === "array") {
		return [generateSchemaExample(schema.items, depth + 1)];
	}

	if (type === "string") {
		const format = typeof schema.format === "string" ? schema.format : undefined;
		return (format && FORMAT_EXAMPLES[format]) ?? "string";
	}

	if (type === "integer" || type === "number") return 0;
	if (type === "boolean") return true;
	if (type === "null") return null;

	return null;
}
