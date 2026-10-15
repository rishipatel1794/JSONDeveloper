import type { JwtPayload } from "@/lib/tools/jwt/types";

const NUMERIC_CLAIMS = ["exp", "nbf", "iat"] as const;

/** Validates the registered claim types the JWT spec actually constrains — doesn't touch custom claims. */
export function validateClaimTypes(payload: JwtPayload): string[] {
	const issues: string[] = [];

	for (const claim of NUMERIC_CLAIMS) {
		const value = payload[claim];
		if (value !== undefined && typeof value !== "number") {
			issues.push(`"${claim}" must be a number (Unix timestamp in seconds), got ${typeof value}.`);
		}
	}

	if (payload.aud !== undefined && typeof payload.aud !== "string" && !Array.isArray(payload.aud)) {
		issues.push(`"aud" must be a string or an array of strings, got ${typeof payload.aud}.`);
	}

	if (Array.isArray(payload.aud) && !payload.aud.every(item => typeof item === "string")) {
		issues.push(`"aud" array must contain only strings.`);
	}

	for (const claim of ["iss", "sub", "jti"] as const) {
		const value = payload[claim];
		if (value !== undefined && typeof value !== "string") {
			issues.push(`"${claim}" must be a string, got ${typeof value}.`);
		}
	}

	return issues;
}

export function buildExpirationWarnings(payload: JwtPayload): string[] {
	const warnings: string[] = [];
	const nowSeconds = Math.floor(Date.now() / 1000);

	if (typeof payload.exp === "number" && payload.exp <= nowSeconds) {
		warnings.push("This token's \"exp\" claim is already in the past — it will be generated as an already-expired token.");
	}

	if (typeof payload.nbf === "number" && typeof payload.exp === "number" && payload.nbf >= payload.exp) {
		warnings.push("\"nbf\" is not before \"exp\" — this token would never be valid.");
	}

	return warnings;
}
