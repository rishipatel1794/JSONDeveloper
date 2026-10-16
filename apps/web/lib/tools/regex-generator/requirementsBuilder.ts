import type { RequirementsOptions, RequirementsResult } from "./types";

function escapeRegExpLiteral(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeForCharClass(value: string): string {
	return value.replace(/[\]\\^-]/g, "\\$&");
}

/**
 * Builds a single anchored pattern from independent, composable constraints: each "must contain X"
 * requirement becomes its own zero-width lookahead (so they don't interfere with each other or with
 * ordering), overall length is enforced the same way, and literal start/end requirements and an
 * allowed/forbidden character class are then applied to the actually-consumed body.
 */
export function buildFromRequirements(options: RequirementsOptions): RequirementsResult {
	const warnings: string[] = [];
	const parts: string[] = ["^"];

	const { minLength, maxLength } = options;
	const lengthIsImpossible = minLength !== undefined && maxLength !== undefined && minLength > maxLength;

	if (lengthIsImpossible) {
		warnings.push(`Minimum length (${minLength}) is greater than maximum length (${maxLength}) — no string can satisfy both, so this pattern will never match anything.`);
		// {min,max} with min > max is invalid regex syntax, not just unsatisfiable — (?!) is a
		// deliberately always-failing assertion so the output stays a syntactically valid regex.
		parts.push("(?!)");
	} else if (minLength !== undefined || maxLength !== undefined) {
		parts.push(`(?=.{${minLength ?? 0},${maxLength ?? ""}}$)`);
	}

	if (options.requireLowercase) parts.push("(?=.*[a-z])");
	if (options.requireUppercase) parts.push("(?=.*[A-Z])");
	if (options.requireNumber) parts.push("(?=.*\\d)");
	if (options.requireSpecial) parts.push("(?=.*[^A-Za-z0-9])");

	const forbiddenSet = new Set(options.forbiddenChars ? [...options.forbiddenChars] : []);

	if (options.allowedChars && options.forbiddenChars) {
		warnings.push("Both allowed and forbidden characters were specified — forbidden characters are ignored, since the allowed set already excludes everything else.");
	}

	if (options.allowedChars) {
		const allowedSet = new Set([...options.allowedChars]);
		if (options.requireUppercase && ![...allowedSet].some(ch => /[A-Z]/.test(ch))) {
			warnings.push("\"Must contain uppercase\" is required, but the allowed-character set contains no uppercase letters — this pattern can never match.");
		}
		if (options.requireLowercase && ![...allowedSet].some(ch => /[a-z]/.test(ch))) {
			warnings.push("\"Must contain lowercase\" is required, but the allowed-character set contains no lowercase letters — this pattern can never match.");
		}
		if (options.requireNumber && ![...allowedSet].some(ch => /\d/.test(ch))) {
			warnings.push("\"Must contain a number\" is required, but the allowed-character set contains no digits — this pattern can never match.");
		}
	}

	if (options.startsWith) {
		const overlapping = [...options.startsWith].filter(ch => forbiddenSet.has(ch) && !options.allowedChars);
		if (overlapping.length > 0) {
			warnings.push(`"Starts with" contains characters also listed as forbidden: ${[...new Set(overlapping)].join(", ")}. The literal prefix is still required as-is.`);
		}
		parts.push(escapeRegExpLiteral(options.startsWith));
	}

	let bodyClass = ".";
	if (options.allowedChars) {
		bodyClass = `[${escapeForCharClass(options.allowedChars)}]`;
	} else if (options.forbiddenChars) {
		bodyClass = `[^${escapeForCharClass(options.forbiddenChars)}]`;
	}
	parts.push(`${bodyClass}*`);

	if (options.endsWith) {
		const overlapping = [...options.endsWith].filter(ch => forbiddenSet.has(ch) && !options.allowedChars);
		if (overlapping.length > 0) {
			warnings.push(`"Ends with" contains characters also listed as forbidden: ${[...new Set(overlapping)].join(", ")}. The literal suffix is still required as-is.`);
		}
		parts.push(escapeRegExpLiteral(options.endsWith));
	}

	parts.push("$");

	return { pattern: parts.join(""), warnings };
}
