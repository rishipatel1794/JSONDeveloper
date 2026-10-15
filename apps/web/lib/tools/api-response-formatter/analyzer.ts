import type { JsonValue } from "@/lib/tools/json-validator/types";
import { getValueType } from "@/lib/tools/json-validator/utils";

import type { AnalysisFinding, ResponseMeta } from "./types";

const PAGINATION_HINT_KEYS = new Set([
	"page",
	"perpage",
	"pagesize",
	"total",
	"totalcount",
	"totalpages",
	"cursor",
	"nextcursor",
	"hasmore",
	"offset",
	"limit",
	"meta",
	"pagination",
]);

const ERROR_HINT_KEYS = new Set(["error", "errors", "message", "detail", "details", "title", "code", "reason"]);

const MAX_ARRAY_ITEMS_TO_COMPARE = 50;
const LARGE_COLLECTION_THRESHOLD = 20;
const EXCESSIVE_DEPTH_THRESHOLD = 7;
const MAX_NULL_PATHS_REPORTED = 10;

function isPlainObject(value: JsonValue): value is Record<string, JsonValue> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeKey(key: string): string {
	return key.toLowerCase().replace(/[_\-\s]/g, "");
}

type NamingStyle = "camelCase" | "snake_case" | "kebab-case" | "PascalCase";

function classifyNaming(key: string): NamingStyle | null {
	if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(key)) return "snake_case";
	if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(key)) return "kebab-case";
	if (/^[A-Z][a-zA-Z0-9]*$/.test(key)) return "PascalCase";
	if (/^[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*$/.test(key)) return "camelCase";
	return null;
}

function findNullPaths(value: JsonValue, path: string, out: string[]): void {
	if (out.length >= MAX_NULL_PATHS_REPORTED) return;

	if (value === null) {
		out.push(path || "root");
		return;
	}

	if (Array.isArray(value)) {
		for (let i = 0; i < value.length && out.length < MAX_NULL_PATHS_REPORTED; i++) {
			findNullPaths(value[i] as JsonValue, `${path}[${i}]`, out);
		}
		return;
	}

	if (isPlainObject(value)) {
		for (const [key, child] of Object.entries(value)) {
			if (out.length >= MAX_NULL_PATHS_REPORTED) return;
			findNullPaths(child, path ? `${path}.${key}` : key, out);
		}
	}
}

/** Collects every object's own key set (not recursing-and-merging) so naming/duplicate checks compare siblings, not unrelated objects. */
function collectObjectKeySets(value: JsonValue, out: string[][], depth = 0): void {
	if (depth > 12 || out.length > 200) return;

	if (isPlainObject(value)) {
		out.push(Object.keys(value));
		for (const child of Object.values(value)) collectObjectKeySets(child, out, depth + 1);
		return;
	}

	if (Array.isArray(value)) {
		for (const item of value.slice(0, MAX_ARRAY_ITEMS_TO_COMPARE)) collectObjectKeySets(item, out, depth + 1);
	}
}

function findNamingInconsistency(keySets: string[][]): { styles: NamingStyle[] } | null {
	const stylesSeen = new Set<NamingStyle>();

	for (const keys of keySets) {
		for (const key of keys) {
			const style = classifyNaming(key);
			if (style) stylesSeen.add(style);
		}
	}

	return stylesSeen.size > 1 ? { styles: [...stylesSeen] } : null;
}

function findDuplicateLookingFields(keySets: string[][]): string[] {
	const collisions = new Set<string>();

	for (const keys of keySets) {
		const seen = new Map<string, string>();
		for (const key of keys) {
			const normalized = normalizeKey(key);
			const existing = seen.get(normalized);
			if (existing && existing !== key) {
				collisions.add(`"${existing}" / "${key}"`);
			} else {
				seen.set(normalized, key);
			}
		}
	}

	return [...collisions];
}

/** Finds the first array of objects worth comparing for inconsistent field types across items. */
function findComparableArray(value: JsonValue, depth = 0): JsonValue[] | null {
	if (depth > 6) return null;

	if (Array.isArray(value) && value.length > 1 && value.every(isPlainObject)) {
		return value;
	}

	if (isPlainObject(value)) {
		for (const child of Object.values(value)) {
			const found = findComparableArray(child, depth + 1);
			if (found) return found;
		}
	}

	return null;
}

function findInconsistentTypesAcrossItems(items: JsonValue[]): string[] {
	const typesByKey = new Map<string, Set<string>>();

	for (const item of items.slice(0, MAX_ARRAY_ITEMS_TO_COMPARE)) {
		if (!isPlainObject(item)) continue;
		for (const [key, value] of Object.entries(item)) {
			const types = typesByKey.get(key) ?? new Set<string>();
			types.add(getValueType(value));
			typesByKey.set(key, types);
		}
	}

	return [...typesByKey.entries()].filter(([, types]) => types.size > 1).map(([key, types]) => `"${key}" (${[...types].join(" / ")})`);
}

function hasPaginationHint(value: JsonValue): boolean {
	if (!isPlainObject(value)) return false;
	return Object.keys(value).some(key => PAGINATION_HINT_KEYS.has(normalizeKey(key)));
}

function hasErrorHint(value: JsonValue): boolean {
	if (!isPlainObject(value)) return false;
	return Object.keys(value).some(key => ERROR_HINT_KEYS.has(normalizeKey(key)));
}

export function analyzeApiResponse(value: JsonValue, meta: ResponseMeta, maxDepth: number): AnalysisFinding[] {
	const findings: AnalysisFinding[] = [];

	findings.push({ id: "valid-json", tone: "positive", title: "Response is valid JSON", detail: "The input parses successfully." });

	const rootType = getValueType(value);
	if (rootType === "object" || rootType === "array") {
		findings.push({ id: "root-type", tone: "positive", title: `Response root is a${rootType === "object" ? "n" : ""} ${rootType}`, detail: `Top-level JSON type: ${rootType}.` });
	} else {
		findings.push({
			id: "root-primitive",
			tone: "observation",
			title: "Root-level value is a primitive",
			detail: `The response root is a bare ${rootType}, not an object or array. Most REST APIs return an object or array at the root so the response can grow additional fields later without a breaking change.`,
		});
	}

	const isEmpty = (isPlainObject(value) && Object.keys(value).length === 0) || (Array.isArray(value) && value.length === 0);
	if (isEmpty) {
		findings.push({ id: "empty-body", tone: "observation", title: "Empty response body", detail: "The parsed value is an empty object or array — confirm this is intentional (e.g. a genuinely empty collection) rather than a bug." });
	}

	if (meta.statusCode !== undefined && meta.statusCode >= 400 && isPlainObject(value) && !hasErrorHint(value)) {
		findings.push({
			id: "error-shape-missing",
			tone: "observation",
			title: "Error response has no obvious error field",
			detail: `Status code ${meta.statusCode} indicates an error, but the body has none of the commonly expected fields (error, message, detail, title, code). Clients will struggle to show a useful message.`,
		});
	}

	if (meta.statusCode !== undefined && meta.statusCode < 400 && isPlainObject(value) && "success" in value && value.success === false) {
		findings.push({
			id: "success-status-mismatch",
			tone: "observation",
			title: "`success: false` with a non-error status code",
			detail: `The body reports \`success: false\` but the provided status code (${meta.statusCode}) is not an error status. Clients that check the status code and clients that check the body may disagree about whether this request succeeded.`,
		});
	}

	const keySets: string[][] = [];
	collectObjectKeySets(value, keySets);

	const naming = findNamingInconsistency(keySets);
	if (naming) {
		findings.push({
			id: "naming-inconsistency",
			tone: "observation",
			title: "Mixed field naming conventions",
			detail: `This response mixes naming styles (${naming.styles.join(", ")}). Picking one convention (commonly camelCase or snake_case) and using it consistently makes the response easier to predict.`,
		});
	}

	const duplicateLooking = findDuplicateLookingFields(keySets);
	if (duplicateLooking.length > 0) {
		findings.push({
			id: "duplicate-looking-fields",
			tone: "observation",
			title: "Similarly-named fields that may be duplicates",
			detail: `Found fields that normalize to the same name but are spelled differently: ${duplicateLooking.join(", ")}. If both represent the same value, consolidating to one avoids ambiguity for clients.`,
		});
	}

	const comparableArray = findComparableArray(value);
	if (comparableArray) {
		const inconsistentTypes = findInconsistentTypesAcrossItems(comparableArray);
		if (inconsistentTypes.length > 0) {
			findings.push({
				id: "inconsistent-item-types",
				tone: "observation",
				title: "Inconsistent field types across array items",
				detail: `Within a collection of similarly-structured objects, these fields have different types in different items: ${inconsistentTypes.join(", ")}.`,
			});
		}
	}

	const candidateCollections: JsonValue[] = [value, ...(isPlainObject(value) ? Object.values(value) : [])];
	const largeCollectionWithoutPagination = candidateCollections.some(candidate => Array.isArray(candidate) && candidate.length > LARGE_COLLECTION_THRESHOLD) && !hasPaginationHint(value);
	if (largeCollectionWithoutPagination) {
		findings.push({
			id: "missing-pagination",
			tone: "observation",
			title: "Large collection without pagination metadata",
			detail: `A collection with more than ${LARGE_COLLECTION_THRESHOLD} items was found, but no pagination-related field (page, total, cursor, meta, etc.) is present. If this endpoint can return arbitrarily many items, consider adding pagination.`,
		});
	}

	if (maxDepth > EXCESSIVE_DEPTH_THRESHOLD) {
		findings.push({
			id: "excessive-nesting",
			tone: "observation",
			title: "Deeply nested structure",
			detail: `This response nests ${maxDepth} levels deep. Very deep nesting is harder for clients to traverse safely — consider flattening or splitting into multiple requests if this wasn't intentional.`,
		});
	}

	const nullPaths: string[] = [];
	findNullPaths(value, "", nullPaths);
	if (nullPaths.length > 0) {
		findings.push({
			id: "null-values",
			tone: "observation",
			title: `${nullPaths.length === MAX_NULL_PATHS_REPORTED ? `${nullPaths.length}+` : nullPaths.length} null value${nullPaths.length === 1 ? "" : "s"} found`,
			detail: `null appears at: ${nullPaths.join(", ")}. Not necessarily a problem — confirm each one is an intentional "no value" rather than a missing field that should have been omitted or populated.`,
		});
	}

	return findings;
}
