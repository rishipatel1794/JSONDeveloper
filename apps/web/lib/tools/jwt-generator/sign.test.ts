import { generateKeyPairSync } from "node:crypto";

import { jwtVerify } from "jose";
import { describe, expect, it } from "vitest";

import type { JwtHeader, JwtPayload } from "@/lib/tools/jwt/types";

import { generateJwt } from "./sign";

const HS256_HEADER: JwtHeader = { alg: "HS256", typ: "JWT" };
const BASE_PAYLOAD: JwtPayload = { sub: "1234567890", name: "Example User" };

describe("generateJwt — symmetric (HS256)", () => {
	it("signs a valid token that verifies with the same secret", async () => {
		const result = await generateJwt({ header: HS256_HEADER, payload: BASE_PAYLOAD, algorithm: "HS256", secret: "test-secret" });

		expect(result.success).toBe(true);
		expect(result.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);

		const { payload } = await jwtVerify(result.token!, new TextEncoder().encode("test-secret"));
		expect(payload.sub).toBe("1234567890");
	});

	it("fails signature verification with the wrong secret", async () => {
		const result = await generateJwt({ header: HS256_HEADER, payload: BASE_PAYLOAD, algorithm: "HS256", secret: "right-secret" });
		await expect(jwtVerify(result.token!, new TextEncoder().encode("wrong-secret"))).rejects.toThrow();
	});

	it("errors when the secret is missing", async () => {
		const result = await generateJwt({ header: HS256_HEADER, payload: BASE_PAYLOAD, algorithm: "HS256" });
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/secret is required/i);
	});

	it("errors when the secret is an empty string", async () => {
		const result = await generateJwt({ header: HS256_HEADER, payload: BASE_PAYLOAD, algorithm: "HS256", secret: "   " });
		expect(result.success).toBe(false);
	});

	it("supports HS384 and HS512", async () => {
		const r384 = await generateJwt({ header: { alg: "HS384" }, payload: BASE_PAYLOAD, algorithm: "HS384", secret: "s" });
		const r512 = await generateJwt({ header: { alg: "HS512" }, payload: BASE_PAYLOAD, algorithm: "HS512", secret: "s" });
		expect(r384.success).toBe(true);
		expect(r512.success).toBe(true);
	});
});

describe("generateJwt — header/algorithm consistency", () => {
	it("errors when the header's alg doesn't match the selected algorithm", async () => {
		const result = await generateJwt({ header: { alg: "HS512" }, payload: BASE_PAYLOAD, algorithm: "HS256", secret: "s" });
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/does not match/i);
	});

	it("rejects an unsupported algorithm", async () => {
		// @ts-expect-error -- deliberately invalid to exercise the guard
		const result = await generateJwt({ header: { alg: "none" }, payload: BASE_PAYLOAD, algorithm: "none", secret: "s" });
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/unsupported algorithm/i);
	});
});

describe("generateJwt — claim validation", () => {
	it("rejects a non-numeric exp", async () => {
		const result = await generateJwt({
			header: HS256_HEADER,
			payload: { ...BASE_PAYLOAD, exp: "soon" as unknown as number },
			algorithm: "HS256",
			secret: "s",
		});
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/"exp" must be a number/);
	});

	it("rejects an aud that is neither a string nor an array of strings", async () => {
		const result = await generateJwt({
			header: HS256_HEADER,
			payload: { ...BASE_PAYLOAD, aud: 123 as unknown as string },
			algorithm: "HS256",
			secret: "s",
		});
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/"aud"/);
	});

	it("accepts an aud array of strings", async () => {
		const result = await generateJwt({ header: HS256_HEADER, payload: { ...BASE_PAYLOAD, aud: ["a", "b"] }, algorithm: "HS256", secret: "s" });
		expect(result.success).toBe(true);
	});

	it("warns, but still generates, when exp is already in the past", async () => {
		const result = await generateJwt({
			header: HS256_HEADER,
			payload: { ...BASE_PAYLOAD, exp: Math.floor(Date.now() / 1000) - 1000 },
			algorithm: "HS256",
			secret: "s",
		});
		expect(result.success).toBe(true);
		expect(result.warnings?.[0]).toMatch(/already in the past/i);
	});
});

describe("generateJwt — asymmetric (RS256)", () => {
	const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
	const pkcs8Pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
	const pkcs1Pem = privateKey.export({ type: "pkcs1", format: "pem" }).toString();

	it("signs a valid token with a PKCS8 PEM private key", async () => {
		const result = await generateJwt({ header: { alg: "RS256" }, payload: BASE_PAYLOAD, algorithm: "RS256", privateKeyPem: pkcs8Pem });
		expect(result.success).toBe(true);
		expect(result.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
	});

	it("errors when the private key is missing", async () => {
		const result = await generateJwt({ header: { alg: "RS256" }, payload: BASE_PAYLOAD, algorithm: "RS256" });
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/private key is required/i);
	});

	it("rejects a PKCS1 ('BEGIN RSA PRIVATE KEY') key with a clear format error", async () => {
		const result = await generateJwt({ header: { alg: "RS256" }, payload: BASE_PAYLOAD, algorithm: "RS256", privateKeyPem: pkcs1Pem });
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/PKCS8/);
	});

	it("rejects garbage that merely contains the right header line", async () => {
		const result = await generateJwt({
			header: { alg: "RS256" },
			payload: BASE_PAYLOAD,
			algorithm: "RS256",
			privateKeyPem: "-----BEGIN PRIVATE KEY-----\nnot-actually-valid\n-----END PRIVATE KEY-----",
		});
		expect(result.success).toBe(false);
	});
});

describe("generateJwt — never leaks the key into the output", () => {
	it("does not include the raw secret anywhere in the generated token", async () => {
		const secret = "super-secret-value-should-not-appear";
		const result = await generateJwt({ header: HS256_HEADER, payload: BASE_PAYLOAD, algorithm: "HS256", secret });
		expect(result.token).not.toContain(secret);
		expect(result.token).not.toContain(Buffer.from(secret).toString("base64"));
	});
});
