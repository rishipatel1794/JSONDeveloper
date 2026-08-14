import type { TokenCandidate } from "./types";

export interface ExtractionResult {
	success: boolean;
	value?: unknown;
	error?: string;
}

/**
 * Resolves a dot/bracket path like "data.access_token" or "data.users[0].id" against a parsed
 * JSON response. Deliberately not a full JSONPath engine — just enough to cover the predictable
 * shapes real APIs return, per the explicit V1 scope.
 */
export function extractJsonValue(json: string, path: string): ExtractionResult {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		return { success: false, error: "Response is not valid JSON." };
	}

	const segments = parsePath(path);
	if (!segments) {
		return { success: false, error: "Invalid path syntax." };
	}

	let current: unknown = parsed;

	for (const segment of segments) {
		if (current === null || current === undefined) {
			return { success: false, error: `Path not found: ${path}` };
		}

		if (typeof segment === "number") {
			if (!Array.isArray(current)) {
				return { success: false, error: `Expected an array at this point in the path.` };
			}
			current = current[segment];
		} else {
			if (typeof current !== "object" || Array.isArray(current)) {
				return { success: false, error: `Expected an object at this point in the path.` };
			}
			current = (current as Record<string, unknown>)[segment];
		}
	}

	if (current === undefined) {
		return { success: false, error: `Path not found: ${path}` };
	}

	return { success: true, value: current };
}

function parsePath(path: string): (string | number)[] | null {
	const trimmed = path.trim();
	if (!trimmed) return null;

	const segments: (string | number)[] = [];
	const pattern = /([^.[\]]+)|\[(\d+)\]/g;
	let match: RegExpExecArray | null;
	let matched = false;

	while ((match = pattern.exec(trimmed)) !== null) {
		matched = true;
		if (match[1] !== undefined) segments.push(match[1]);
		else if (match[2] !== undefined) segments.push(Number(match[2]));
	}

	return matched ? segments : null;
}

/** A value is treated as JWT-shaped if it has exactly 3 base64url segments — the header/payload/signature shape. */
export function isJwtLike(value: string): boolean {
	const parts = value.split(".");
	return parts.length === 3 && parts.every(part => part.length > 0 && /^[A-Za-z0-9_-]+$/.test(part));
}

const TOKEN_KEY_PATTERN = /^(access_token|accessToken|token|jwt|id_token|idToken|refresh_token|refreshToken)$/;

/**
 * Scans a JSON response for common auth-token field names at a shallow depth. Only ever offered as
 * a suggestion — nothing is saved as a variable without the user explicitly confirming.
 */
export function findTokenCandidates(json: string, maxDepth = 4): TokenCandidate[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		return [];
	}

	const results: TokenCandidate[] = [];

	function walk(node: unknown, path: string, depth: number) {
		if (depth > maxDepth || typeof node !== "object" || node === null || Array.isArray(node)) return;

		for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
			const nextPath = path ? `${path}.${key}` : key;

			if (typeof value === "string" && TOKEN_KEY_PATTERN.test(key)) {
				results.push({ path: nextPath, value, looksLikeJwt: isJwtLike(value) });
			} else if (typeof value === "object" && value !== null) {
				walk(value, nextPath, depth + 1);
			}
		}
	}

	walk(parsed, "", 0);
	return results;
}
