import type { JsonValue } from "@/lib/tools/json-validator/types";
import { type FieldType, inferShapes, type ObjectShape } from "@/lib/tools/json-validator/type-inference";

/** Strips a `null` option out of a union (or bare null type), reporting whether the field should be considered nullable. */
function resolveNullable(type: FieldType): { type: FieldType; nullable: boolean } {
	if (type.kind === "null") return { type: { kind: "unknown" }, nullable: true };
	if (type.kind !== "union") return { type, nullable: false };

	const withoutNull = type.options.filter(option => option.kind !== "null");
	if (withoutNull.length === type.options.length) return { type, nullable: false };
	if (withoutNull.length === 1) return { type: withoutNull[0]!, nullable: true };
	return { type: { kind: "union", options: withoutNull }, nullable: true };
}

interface Imports {
	list: boolean;
	optional: boolean;
	union: boolean;
	any: boolean;
}

function renderPythonType(type: FieldType, imports: Imports): string {
	switch (type.kind) {
		case "string":
			return "str";
		case "number":
			return "float";
		case "boolean":
			return "bool";
		case "null":
		case "unknown":
			imports.any = true;
			return "Any";
		case "object":
			return type.ref;
		case "array": {
			imports.list = true;
			return `List[${renderPythonType(type.items, imports)}]`;
		}
		case "union": {
			imports.union = true;
			return `Union[${type.options.map(option => renderPythonType(option, imports)).join(", ")}]`;
		}
	}
}

function renderClass(shape: ObjectShape, imports: Imports): string {
	const { required, optional } = shape.properties.reduce(
		(acc, property) => {
			(property.optional ? acc.optional : acc.required).push(property);
			return acc;
		},
		{ required: [] as typeof shape.properties, optional: [] as typeof shape.properties },
	);

	const lines: string[] = [];

	for (const property of required) {
		const { type, nullable } = resolveNullable(property.type);
		let rendered = renderPythonType(type, imports);
		if (nullable) {
			imports.optional = true;
			rendered = `Optional[${rendered}]`;
		}
		lines.push(`    ${property.key}: ${rendered}`);
	}

	// Dataclass fields with a default value must come after fields without one — optional
	// properties always get `= None`, so they're emitted last regardless of source order.
	for (const property of optional) {
		const { type } = resolveNullable(property.type);
		imports.optional = true;
		lines.push(`    ${property.key}: Optional[${renderPythonType(type, imports)}] = None`);
	}

	if (lines.length === 0) lines.push("    pass");

	return `@dataclass\nclass ${shape.name}:\n${lines.join("\n")}`;
}

/** Generates Python dataclasses for a sample JSON value. */
export function generatePython(value: JsonValue, rootName = "Root"): string {
	const { shapes, root, rootIsArray } = inferShapes(value, rootName);
	const imports: Imports = { list: false, optional: false, union: false, any: false };

	const classBlocks = shapes.map(shape => renderClass(shape, imports));

	const trailingBlocks: string[] = [];
	if (rootIsArray) {
		trailingBlocks.push(`${rootName}List = List[${renderPythonType(root, imports)}]`);
	} else if (root.kind !== "object") {
		trailingBlocks.push(`${rootName} = ${renderPythonType(root, imports)}`);
	}

	const typingNames = [imports.any && "Any", imports.list && "List", imports.optional && "Optional", imports.union && "Union"].filter(Boolean);

	const header = ["from dataclasses import dataclass", typingNames.length > 0 ? `from typing import ${typingNames.join(", ")}` : null]
		.filter((line): line is string => Boolean(line))
		.join("\n");

	return [header, ...classBlocks, ...trailingBlocks].join("\n\n\n");
}
