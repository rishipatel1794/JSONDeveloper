export interface JwtHeader {
	alg?: string;
	typ?: string;
	[key: string]: unknown;
}

export interface JwtPayload {
	iss?: string;
	sub?: string;
	aud?: string | string[];
	exp?: number;
	nbf?: number;
	iat?: number;
	jti?: string;
	[key: string]: unknown;
}

export interface DecodedJwt {
	header: JwtHeader;
	payload: JwtPayload;
	signature: string;
	raw: {
		header: string;
		payload: string;
		signature: string;
	};
}

export interface JwtDecodeResult {
	success: boolean;
	data?: DecodedJwt;
	error?: string;
}

export const STANDARD_CLAIMS = ["iss", "sub", "aud", "exp", "nbf", "iat", "jti"] as const;

export type StandardClaim = (typeof STANDARD_CLAIMS)[number];
