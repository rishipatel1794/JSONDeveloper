import type { JsonValue } from "@/lib/tools/json-validator/types";
import { type FieldType, inferShapes, type ObjectShape } from "@/lib/tools/json-validator/type-inference";

/** Strips a `null` option out of a union (or bare null type), reporting whether the property should be nullable (`?type`). */
function resolveNullable(type: FieldType): { type: FieldType; nullable: boolean } {
	if (type.kind === "null") return { type: { kind: "unknown" }, nullable: true };
	if (type.kind !== "union") return { type, nullable: false };

	const withoutNull = type.options.filter(option => option.kind !== "null");
	if (withoutNull.length === type.options.length) return { type, nullable: false };
	if (withoutNull.length === 1) return { type: withoutNull[0]!, nullable: true };
	return { type: { kind: "union", options: withoutNull }, nullable: true };
}

/** The type PHP can actually enforce at runtime — arrays lose their item type, so PHPDoc fills that in separately. */
function renderPhpTypeHint(type: FieldType): string {
	switch (type.kind) {
		case "string":
			return "string";
		case "boolean":
			return "bool";
		case "number":
			return "int|float";
		case "array":
			return "array";
		case "object":
			return type.ref;
		case "null":
		case "unknown":
			return "mixed";
		case "union":
			return type.options.every(option => option.kind !== "array" && option.kind !== "object")
				? type.options.map(renderPhpTypeHint).join("|")
				: "mixed";
	}
}

/** The precise type for a `@param`/`@var` PHPDoc tag — this is where array item types (`string[]`) actually show up. */
function renderPhpDocType(type: FieldType): string {
	switch (type.kind) {
		case "array": {
			const itemType = renderPhpDocType(type.items);
			return itemType.includes("|") ? `(${itemType})[]` : `${itemType}[]`;
		}
		case "union":
			return type.options.map(renderPhpDocType).join("|");
		default:
			return renderPhpTypeHint(type);
	}
}

function renderClass(shape: ObjectShape): string {
	const params = shape.properties.map(property => {
		const { type, nullable } = resolveNullable(property.type);
		const isNullable = nullable || property.optional;
		const typeHint = renderPhpTypeHint(type);
		const docType = renderPhpDocType(type);

		return {
			key: property.key,
			docType: isNullable ? `${docType}|null` : docType,
			declaration: `public ${isNullable ? `?${typeHint}` : typeHint} $${property.key}${isNullable ? " = null" : ""},`,
		};
	});

	const docBlock = ["    /**", ...params.map(param => `     * @param ${param.docType} $${param.key}`), "     */"].join("\n");

	const constructorLines = params.map(param => `        ${param.declaration}`);

	return `class ${shape.name}\n{\n${docBlock}\n    public function __construct(\n${constructorLines.join("\n")}\n    ) {}\n}`;
}

/** Generates PHP 8 classes (constructor property promotion + PHPDoc for array item types) for a sample JSON value. */
export function generatePhp(value: JsonValue, rootName = "Root"): string {
	const { shapes, root, rootIsArray } = inferShapes(value, rootName);

	const classBlocks = shapes.map(renderClass);

	const notes: string[] = [];
	if (rootIsArray) {
		notes.push(`// The root JSON value is a list: ${renderPhpDocType(root)}[]`);
	} else if (root.kind !== "object") {
		notes.push(`// The root JSON value is a single ${renderPhpDocType(root)}, not an object.`);
	}

	return ["<?php", ...notes, ...classBlocks].join("\n\n");
}
