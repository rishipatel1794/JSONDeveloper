import type { JwtHeader, JwtPayload } from "@/lib/tools/jwt/types";

export const SYMMETRIC_ALGORITHMS = ["HS256", "HS384", "HS512"] as const;
export const ASYMMETRIC_ALGORITHMS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA"] as const;

export type SymmetricAlgorithm = (typeof SYMMETRIC_ALGORITHMS)[number];
export type AsymmetricAlgorithm = (typeof ASYMMETRIC_ALGORITHMS)[number];
export type JwtAlgorithm = SymmetricAlgorithm | AsymmetricAlgorithm;

export const ALL_ALGORITHMS: readonly JwtAlgorithm[] = [...SYMMETRIC_ALGORITHMS, ...ASYMMETRIC_ALGORITHMS];

export function isSymmetricAlgorithm(algorithm: string): algorithm is SymmetricAlgorithm {
	return (SYMMETRIC_ALGORITHMS as readonly string[]).includes(algorithm);
}

export interface GenerateJwtInput {
	header: JwtHeader;
	payload: JwtPayload;
	algorithm: JwtAlgorithm;
	secret?: string;
	privateKeyPem?: string;
}

export interface GenerateJwtResult {
	success: boolean;
	token?: string;
	error?: string;
	/** Non-blocking notices — e.g. the configured token is already expired. Shown, never silently hidden. */
	warnings?: string[];
}

export type { JwtHeader, JwtPayload };
