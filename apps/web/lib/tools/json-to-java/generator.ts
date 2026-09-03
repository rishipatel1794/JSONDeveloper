import type { JsonValue } from "@/lib/tools/json-validator/types";
import { type FieldType, inferShapes, type ObjectShape } from "@/lib/tools/json-validator/type-inference";

/** Strips a `null` option out of a union (or bare null type) — Java has no nullable annotation to add, but the comment is useful context. */
function resolveNullable(type: FieldType): FieldType {
	if (type.kind === "null") return { kind: "unknown" };
	if (type.kind !== "union") return type;

	const withoutNull = type.options.filter(option => option.kind !== "null");
	if (withoutNull.length === type.options.length) return type;
	if (withoutNull.length === 1) return withoutNull[0]!;
	return { kind: "union", options: withoutNull };
}

function capitalize(word: string): string {
	return word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
}

/** camelCase a JSON key for use as a Java field/accessor name (`user_id` -> `userId`). */
function toCamelCase(key: string): string {
	const parts = key.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	if (parts.length === 0) return "value";
	return parts[0]!.toLowerCase() + parts.slice(1).map(capitalize).join("");
}

interface Imports {
	list: boolean;
}

function renderJavaType(type: FieldType, imports: Imports): string {
	switch (type.kind) {
		case "string":
			return "String";
		case "number":
			return "Double";
		case "boolean":
			return "Boolean";
		case "null":
		case "unknown":
			return "Object";
		case "object":
			return type.ref;
		case "array": {
			imports.list = true;
			return `List<${renderJavaType(type.items, imports)}>`;
		}
		case "union":
			// Java has no union types — Object is the only common supertype for mixed shapes.
			return "Object";
	}
}

function renderClass(shape: ObjectShape, imports: Imports): string {
	const fields = shape.properties.map(property => {
		const resolved = resolveNullable(property.type);
		const javaType = renderJavaType(resolved, imports);
		const fieldName = toCamelCase(property.key);
		const comment = resolved.kind === "union" ? ` // ${describeUnion(resolved)}` : "";
		return { key: property.key, fieldName, javaType, comment };
	});

	const fieldLines = fields.flatMap(field => {
		const renameNote = field.fieldName !== field.key ? [`    // JSON key: "${field.key}"`] : [];
		return [...renameNote, `    private ${field.javaType} ${field.fieldName};${field.comment}`];
	});

	const accessorLines = fields.flatMap(field => {
		const accessorSuffix = capitalize(field.fieldName);
		return [
			"",
			`    public ${field.javaType} get${accessorSuffix}() {`,
			`        return ${field.fieldName};`,
			"    }",
			"",
			`    public void set${accessorSuffix}(${field.javaType} ${field.fieldName}) {`,
			`        this.${field.fieldName} = ${field.fieldName};`,
			"    }",
		];
	});

	return `public class ${shape.name} {\n${fieldLines.join("\n")}\n${accessorLines.join("\n")}\n}`;
}

function describeUnion(type: FieldType): string {
	if (type.kind !== "union") return "";
	return type.options.map(option => (option.kind === "object" ? option.ref : option.kind)).join(" | ");
}

/** Generates Java POJO classes (private fields + getters/setters) for a sample JSON value. */
export function generateJava(value: JsonValue, rootName = "Root"): string {
	const { shapes, root, rootIsArray } = inferShapes(value, rootName);
	const imports: Imports = { list: false };

	const classBlocks = shapes.map(shape => renderClass(shape, imports));

	const notes: string[] = [];
	if (rootIsArray) {
		notes.push(`// The root JSON value is a list: List<${renderJavaType(root, imports)}> ${rootName.toLowerCase()}List = ...;`);
	} else if (root.kind !== "object") {
		notes.push(`// The root JSON value is a single ${renderJavaType(root, imports)}, not an object.`);
	}

	const header = imports.list ? "import java.util.List;" : null;

	return [header, ...notes, ...classBlocks].filter((block): block is string => Boolean(block)).join("\n\n");
}
