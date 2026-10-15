import type { JwtHeader, JwtPayload } from "@/lib/tools/jwt/types";

/** Matches the literal example from the spec — `0` placeholders are intentional, not real values. Use `withCurrentIatAndExp` to populate real ones. */
export const DEFAULT_HEADER: JwtHeader = { alg: "HS256", typ: "JWT" };
export const DEFAULT_PAYLOAD: JwtPayload = { sub: "1234567890", name: "Example User", iat: 0, exp: 0 };

export function currentUnixTimestamp(): number {
	return Math.floor(Date.now() / 1000);
}

export function withCurrentIatAndExp(payload: JwtPayload, expiresInSeconds: number): JwtPayload {
	const iat = currentUnixTimestamp();
	return { ...payload, iat, exp: iat + expiresInSeconds };
}

export const EXPIRATION_PRESETS: Array<{ label: string; seconds: number }> = [
	{ label: "15 minutes", seconds: 15 * 60 },
	{ label: "1 hour", seconds: 60 * 60 },
	{ label: "1 day", seconds: 24 * 60 * 60 },
	{ label: "7 days", seconds: 7 * 24 * 60 * 60 },
	{ label: "30 days", seconds: 30 * 24 * 60 * 60 },
];
