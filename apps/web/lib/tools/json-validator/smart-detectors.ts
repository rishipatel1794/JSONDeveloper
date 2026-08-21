import type { JsonValue } from "./types";
import { isPlainObject } from "./utils";

export type SmartDetectionKind = "jwt" | "url" | "base64";

export interface SmartDetection {
	path: string;
	value: string;
	kind: SmartDetectionKind;
}

const JWT_SHAPE_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;

function decodeBase64Url(segment: string): string | null {
	try {
		const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
		const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
		return typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("utf8");
	} catch {
		return null;
	}
}

/** Requires the dot-separated shape AND a decodable header containing `alg`/`typ` — reduces false positives on arbitrary dotted strings. */
function looksLikeJwt(value: string): boolean {
	if (!JWT_SHAPE_PATTERN.test(value)) return false;

	const header = value.split(".")[0]!;
	const decoded = decodeBase64Url(header);
	if (!decoded) return false;

	try {
		const parsed: unknown = JSON.parse(decoded);
		return isPlainObject(parsed as JsonValue) && ("alg" in (parsed as Record<string, unknown>) || "typ" in (parsed as Record<string, unknown>));
	} catch {
		return false;
	}
}

function looksLikeUrl(value: string): boolean {
	if (!/^https?:\/\//i.test(value)) return false;
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
}

/** Base64 detection is inherently heuristic — require a plausible length/alphabet to keep false positives low. */
function looksLikeBase64(value: string): boolean {
	if (value.length < 16 || value.length % 4 !== 0) return false;
	if (!BASE64_PATTERN.test(value)) return false;
	return /[+/=]/.test(value) || /[0-9]/.test(value);
}

const MAX_DETECTIONS = 20;

/** Scans every string leaf for JWT/URL/base64-like values. Confidence-ordered — a value is reported as only its most specific kind. */
export function detectSmartValues(value: JsonValue): SmartDetection[] {
	const detections: SmartDetection[] = [];

	function visit(node: JsonValue, path: string): void {
		if (detections.length >= MAX_DETECTIONS) return;

		if (typeof node === "string") {
			if (looksLikeJwt(node)) detections.push({ path, value: node, kind: "jwt" });
			else if (looksLikeUrl(node)) detections.push({ path, value: node, kind: "url" });
			else if (looksLikeBase64(node)) detections.push({ path, value: node, kind: "base64" });
			return;
		}

		if (Array.isArray(node)) {
			node.forEach((item, index) => visit(item, `${path}[${index}]`));
			return;
		}

		if (isPlainObject(node)) {
			for (const [key, childValue] of Object.entries(node)) visit(childValue, path ? `${path}.${key}` : key);
		}
	}

	visit(value, "");
	return detections;
}
