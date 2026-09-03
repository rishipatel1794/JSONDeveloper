import type { JsonValue } from "./types";
import { isPlainObject } from "./utils";

export type PrimitiveKind = "string" | "number" | "boolean" | "null" | "unknown";

export type FieldType =
	| { kind: PrimitiveKind }
	| { kind: "array"; items: FieldType }
	| { kind: "object"; ref: string }
	| { kind: "union"; options: FieldType[] };

export interface ShapeProperty {
	key: string;
	type: FieldType;
	optional: boolean;
}

export interface ObjectShape {
	name: string;
	properties: ShapeProperty[];
}

export interface InferenceResult {
	/** Named object shapes, children before parents — safe to emit in this order with no forward references. */
	shapes: ObjectShape[];
	root: FieldType;
	/** True when the root JSON value itself is an array, so generators know to also emit e.g. `type RootList = Root[]`. */
	rootIsArray: boolean;
}

function capitalize(word: string): string {
	if (!word) return "Value";
	return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Normalizes an arbitrary property key (snake_case, kebab-case, spaced) into a PascalCase type name. */
function toPascalCase(key: string): string {
	const parts = key.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	if (parts.length === 0) return "Value";
	return parts.map(capitalize).join("");
}

/** Deliberately simple heuristic singularization — good enough for common plural property names (users, roles, categories). */
function singularize(word: string): string {
	if (/[^aeiou]ies$/i.test(word)) return word.slice(0, -3) + "y";
	if (/(ses|xes|ches|shes|zes)$/i.test(word)) return word.slice(0, -2);
	if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1);
	return word;
}

function fieldTypeSignature(type: FieldType): string {
	switch (type.kind) {
		case "array":
			return `array<${fieldTypeSignature(type.items)}>`;
		case "union":
			return `union<${type.options.map(fieldTypeSignature).sort().join("|")}>`;
		case "object":
			return `ref<${type.ref}>`;
		default:
			return type.kind;
	}
}

function shapeSignature(properties: ShapeProperty[]): string {
	return properties
		.map(property => `${property.key}${property.optional ? "?" : ""}:${fieldTypeSignature(property.type)}`)
		.sort()
		.join(",");
}

class InferenceContext {
	shapes: ObjectShape[] = [];
	private readonly signatureToName = new Map<string, string>();
	private readonly usedNames = new Set<string>();

	/** Registers an object shape, reusing an existing name when an identical shape was already seen (avoids duplicate interfaces). */
	registerObjectShape(desiredName: string, properties: ShapeProperty[]): string {
		const signature = shapeSignature(properties);
		const existing = this.signatureToName.get(signature);
		if (existing) return existing;

		const base = toPascalCase(desiredName);
		let name = base;
		let suffix = 2;
		while (this.usedNames.has(name)) {
			name = `${base}${suffix}`;
			suffix++;
		}

		this.usedNames.add(name);
		this.signatureToName.set(signature, name);
		this.shapes.push({ name, properties });
		return name;
	}
}

function unionFieldTypes(types: FieldType[]): FieldType {
	if (types.length === 0) return { kind: "unknown" };

	const bySignature = new Map<string, FieldType>();
	for (const type of types) bySignature.set(fieldTypeSignature(type), type);

	const options = [...bySignature.values()];
	return options.length === 1 ? options[0]! : { kind: "union", options };
}

function mergeObjectElements(objects: Record<string, JsonValue>[], desiredName: string, ctx: InferenceContext): FieldType {
	const allKeys = new Set<string>();
	for (const object of objects) for (const key of Object.keys(object)) allKeys.add(key);

	const properties: ShapeProperty[] = [...allKeys].map(key => {
		const presentIn = objects.filter(object => Object.prototype.hasOwnProperty.call(object, key));
		const optional = presentIn.length < objects.length;
		const valueTypes = presentIn.map(object => inferFieldType(object[key]!, key, ctx));
		return { key, type: unionFieldTypes(valueTypes), optional };
	});

	const name = ctx.registerObjectShape(desiredName, properties);
	return { kind: "object", ref: name };
}

function inferFieldType(value: JsonValue, desiredName: string, ctx: InferenceContext): FieldType {
	if (value === null) return { kind: "null" };
	if (typeof value === "string") return { kind: "string" };
	if (typeof value === "number") return { kind: "number" };
	if (typeof value === "boolean") return { kind: "boolean" };

	if (Array.isArray(value)) {
		if (value.length === 0) return { kind: "array", items: { kind: "unknown" } };

		const itemName = singularize(desiredName);

		if (value.every(isPlainObject)) {
			return { kind: "array", items: mergeObjectElements(value as Record<string, JsonValue>[], itemName, ctx) };
		}

		return { kind: "array", items: unionFieldTypes(value.map(item => inferFieldType(item, itemName, ctx))) };
	}

	const properties: ShapeProperty[] = Object.entries(value).map(([key, childValue]) => ({
		key,
		type: inferFieldType(childValue, key, ctx),
		optional: false,
	}));

	return { kind: "object", ref: ctx.registerObjectShape(desiredName, properties) };
}

/** Infers named object shapes + the root type for a sample JSON value — shared by the TypeScript, Zod, Python, PHP, and Java generators. */
export function inferShapes(value: JsonValue, rootName = "Root"): InferenceResult {
	const ctx = new InferenceContext();

	if (Array.isArray(value) && value.length > 0 && value.every(isPlainObject)) {
		const itemType = mergeObjectElements(value as Record<string, JsonValue>[], rootName, ctx);
		return { shapes: ctx.shapes, root: itemType, rootIsArray: true };
	}

	if (Array.isArray(value)) {
		const itemType = value.length === 0 ? { kind: "unknown" as const } : unionFieldTypes(value.map(item => inferFieldType(item, rootName, ctx)));
		return { shapes: ctx.shapes, root: itemType, rootIsArray: true };
	}

	return { shapes: ctx.shapes, root: inferFieldType(value, rootName, ctx), rootIsArray: false };
}
