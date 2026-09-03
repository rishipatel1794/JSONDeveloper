import type { JsonValue } from "./types";
import { type FieldType, inferShapes } from "./type-inference";

function renderType(type: FieldType): string {
	switch (type.kind) {
		case "string":
			return "string";
		case "number":
			return "number";
		case "boolean":
			return "boolean";
		case "null":
			return "null";
		case "unknown":
			return "unknown";
		case "object":
			return type.ref;
		case "array": {
			const rendered = renderType(type.items);
			return rendered.includes(" ") ? `(${rendered})[]` : `${rendered}[]`;
		}
		case "union":
			return type.options.map(renderType).join(" | ");
	}
}

/** Generates TypeScript interfaces for a sample JSON value — deterministic, no dependency on a schema library. */
export function generateTypeScript(value: JsonValue, rootName = "Root"): string {
	const { shapes, root, rootIsArray } = inferShapes(value, rootName);
	const blocks: string[] = [];

	for (const shape of shapes) {
		const lines = shape.properties.map(property => `  ${property.key}${property.optional ? "?" : ""}: ${renderType(property.type)};`);
		blocks.push(`interface ${shape.name} {\n${lines.join("\n")}\n}`);
	}

	if (rootIsArray) {
		blocks.push(`type ${rootName}List = ${renderType(root)}[];`);
	} else if (root.kind !== "object") {
		blocks.push(`type ${rootName} = ${renderType(root)};`);
	}

	return blocks.join("\n\n");
}
