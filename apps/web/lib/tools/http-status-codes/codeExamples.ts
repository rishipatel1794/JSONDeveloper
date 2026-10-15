import type { ApiExample, StatusCode } from "./types";

export interface FrameworkExample {
	platform: "Express.js" | "Laravel" | "Spring Boot";
	code: string;
}

/**
 * Generated from the same `apiExample` shown as JSON, rather than maintained as separate hand-written
 * snippets per status code — keeps the three framework examples and the JSON example from ever drifting
 * out of sync with each other.
 */
export function buildFrameworkExamples(statusCode: StatusCode): FrameworkExample[] {
	const example = statusCode.apiExample;
	if (!example) return [];

	return [
		{ platform: "Express.js", code: expressExample(example) },
		{ platform: "Laravel", code: laravelExample(example) },
		{ platform: "Spring Boot", code: springBootExample(example) },
	];
}

function expressExample(example: ApiExample): string {
	const body = example.body !== undefined ? `res.status(${example.status}).json(${JSON.stringify(example.body, null, 2)});` : `res.status(${example.status}).end();`;

	return `app.${example.method.toLowerCase()}("/example", (req, res) => {\n  ${body}\n});`;
}

function laravelExample(example: ApiExample): string {
	if (example.body === undefined) {
		return `return response()->noContent(${example.status});`;
	}

	return `return response()->json(${phpArrayLiteral(example.body)}, ${example.status});`;
}

function springBootExample(example: ApiExample): string {
	const methodAnnotation = `@${capitalize(example.method.toLowerCase())}Mapping("/example")`;

	if (example.body === undefined) {
		return `${methodAnnotation}\npublic ResponseEntity<Void> example() {\n  return ResponseEntity.status(${example.status}).build();\n}`;
	}

	return `${methodAnnotation}\npublic ResponseEntity<Map<String, Object>> example() {\n  Map<String, Object> body = new HashMap<>();\n${javaMapPuts(example.body)}  return ResponseEntity.status(${example.status}).body(body);\n}`;
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function phpArrayLiteral(value: unknown, indent = 0): string {
	const pad = "    ".repeat(indent);
	const innerPad = "    ".repeat(indent + 1);

	if (Array.isArray(value)) {
		const items = value.map(item => `${innerPad}${phpArrayLiteral(item, indent + 1)}`).join(",\n");
		return `[\n${items}\n${pad}]`;
	}

	if (value !== null && typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>)
			.map(([key, val]) => `${innerPad}'${key}' => ${phpArrayLiteral(val, indent + 1)}`)
			.join(",\n");
		return `[\n${entries}\n${pad}]`;
	}

	if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`;
	return String(value);
}

function javaMapPuts(value: unknown, prefix = "body"): string {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return "";
	}

	return Object.entries(value as Record<string, unknown>)
		.map(([key, val]) => `  ${prefix}.put("${key}", ${javaValueLiteral(val)});\n`)
		.join("");
}

function javaValueLiteral(value: unknown): string {
	if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
	if (value !== null && typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '\\"')}"`;
	return String(value);
}
