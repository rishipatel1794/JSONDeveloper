import type { JsonValue } from "./types";

export function isPlainObject(value: unknown): value is Record<string, JsonValue> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null";

export function getValueType(value: JsonValue): JsonValueType {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	if (typeof value === "object") return "object";
	return typeof value as "string" | "number" | "boolean";
}

export function deepEqualJson(a: JsonValue, b: JsonValue): boolean {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((item, index) => deepEqualJson(item, b[index] as JsonValue));
	}
	if (isPlainObject(a) && isPlainObject(b)) {
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		return aKeys.length === bKeys.length && aKeys.every(key => Object.prototype.hasOwnProperty.call(b, key) && deepEqualJson(a[key]!, b[key]!));
	}
	return false;
}

export function computeUtf8ByteLength(text: string): number {
	return new TextEncoder().encode(text).length;
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
