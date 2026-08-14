/**
 * Decodes a Base64URL-encoded string (the encoding JWTs use) into a UTF-8 string.
 * Base64URL swaps `+`/`/` for `-`/`_` and drops padding, so both have to be restored
 * before the browser's Base64 decoder (atob) will accept the input.
 */
export function base64UrlDecode(value: string): string {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

	return new TextDecoder().decode(bytes);
}

export function formatTimestamp(seconds: number): string {
	const date = new Date(seconds * 1000);

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "medium",
	}).format(date);
}

/** Returns null when there's no exp claim to evaluate, otherwise whether the token has expired. */
export function isExpired(exp: unknown): boolean | null {
	if (typeof exp !== "number") return null;

	return Date.now() >= exp * 1000;
}

/** Returns null when there's no nbf claim to evaluate, otherwise whether the token isn't active yet. */
export function isNotYetValid(nbf: unknown): boolean | null {
	if (typeof nbf !== "number") return null;

	return Date.now() < nbf * 1000;
}

/** The well-known jwt.io example token — public, non-sensitive, safe for demoing the decoder. */
export const SAMPLE_JWT =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export function formatClaimValue(value: unknown): string {
	if (Array.isArray(value)) return value.join(", ");
	if (typeof value === "object" && value !== null) return JSON.stringify(value);

	return String(value);
}
