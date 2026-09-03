import type { JsonValue } from "./types";
import { type FieldType, inferShapes } from "./type-inference";

function renderZod(type: FieldType): string {
	switch (type.kind) {
		case "string":
			return "z.string()";
		case "number":
			return "z.number()";
		case "boolean":
			return "z.boolean()";
		case "null":
			return "z.null()";
		case "unknown":
			return "z.unknown()";
		case "object":
			return `${type.ref}Schema`;
		case "array":
			return `z.array(${renderZod(type.items)})`;
		case "union":
			return `z.union([${type.options.map(renderZod).join(", ")}])`;
	}
}

/** Generates a Zod schema for a sample JSON value — deterministic; `zod` itself is not a runtime dependency of this tool. */
export function generateZod(value: JsonValue, rootName = "Root"): string {
	const { shapes, root, rootIsArray } = inferShapes(value, rootName);
	const blocks: string[] = [`import { z } from "zod";`];

	for (const shape of shapes) {
		const lines = shape.properties.map(property => {
			const rendered = renderZod(property.type);
			return `  ${property.key}: ${property.optional ? `${rendered}.optional()` : rendered},`;
		});
		blocks.push(`const ${shape.name}Schema = z.object({\n${lines.join("\n")}\n});`);
	}

	if (rootIsArray) {
		blocks.push(`const ${rootName}ListSchema = z.array(${renderZod(root)});`);
	} else if (root.kind !== "object") {
		blocks.push(`const ${rootName}Schema = ${renderZod(root)};`);
	}

	return blocks.join("\n\n");
}
