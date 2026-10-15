import { importPKCS8, SignJWT, type KeyLike } from "jose";

import { buildExpirationWarnings, validateClaimTypes } from "./claims";
import { ALL_ALGORITHMS, isSymmetricAlgorithm, type GenerateJwtInput, type GenerateJwtResult } from "./types";

/**
 * Signs entirely client-side via `jose` (Web Crypto under the hood) — never implements a signing
 * algorithm by hand, and never sends the secret or private key anywhere. The caller is responsible
 * for not persisting `secret`/`privateKeyPem` outside component state.
 */
export async function generateJwt(input: GenerateJwtInput): Promise<GenerateJwtResult> {
	const { header, payload, algorithm } = input;

	if (!(ALL_ALGORITHMS as readonly string[]).includes(algorithm)) {
		return { success: false, error: `Unsupported algorithm: "${algorithm}".` };
	}

	if (header.alg !== undefined && header.alg !== algorithm) {
		return {
			success: false,
			error: `The header's "alg" ("${header.alg}") does not match the selected signing algorithm ("${algorithm}"). Update one so they match before generating.`,
		};
	}

	const claimIssues = validateClaimTypes(payload);
	if (claimIssues.length > 0) {
		return { success: false, error: `Invalid claim types: ${claimIssues.join(" ")}` };
	}

	let key: Uint8Array | KeyLike;

	if (isSymmetricAlgorithm(algorithm)) {
		if (!input.secret || input.secret.trim() === "") {
			return { success: false, error: "A signing secret is required for symmetric algorithms (HS256, HS384, HS512)." };
		}
		key = new TextEncoder().encode(input.secret);
	} else {
		const pem = input.privateKeyPem?.trim();
		if (!pem) {
			return { success: false, error: "A private key is required for asymmetric algorithms. Paste a PKCS8 PEM private key." };
		}
		if (!pem.includes("BEGIN PRIVATE KEY")) {
			return {
				success: false,
				error:
					'Invalid key format. Asymmetric signing requires a PKCS8 PEM private key, starting with "-----BEGIN PRIVATE KEY-----". A PKCS1 key ("-----BEGIN RSA PRIVATE KEY-----") must be converted to PKCS8 first, e.g. with `openssl pkcs8 -topk8 -nocrypt`.',
			};
		}

		try {
			key = await importPKCS8(pem, algorithm);
		} catch {
			return {
				success: false,
				error: `Could not use this private key for ${algorithm}. Confirm it's a valid PKCS8 PEM key of the correct type for the selected algorithm (e.g. an EC key for ES256, not an RSA key).`,
			};
		}
	}

	try {
		const headerToSign = { ...header, alg: algorithm };
		const token = await new SignJWT(payload).setProtectedHeader(headerToSign).sign(key);
		const warnings = buildExpirationWarnings(payload);
		return { success: true, token, warnings: warnings.length > 0 ? warnings : undefined };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Signing failed.";
		return { success: false, error: `Signing failed: ${message}` };
	}
}
