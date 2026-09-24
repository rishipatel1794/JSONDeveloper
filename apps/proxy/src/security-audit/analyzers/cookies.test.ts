import { describe, expect, it } from "vitest";

import { analyzeCookies, parseCookies } from "./cookies";

describe("parseCookies", () => {
	it("parses attributes and masks the value", () => {
		const [cookie] = parseCookies(["session_id=abc123secret; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600"]);
		expect(cookie!.name).toBe("session_id");
		expect(cookie!.maskedValue).not.toContain("secret");
		expect(cookie!.maskedValue).toMatch(/^\*+$/);
		expect(cookie!.secure).toBe(true);
		expect(cookie!.httpOnly).toBe(true);
		expect(cookie!.sameSite).toBe("Lax");
		expect(cookie!.path).toBe("/");
		expect(cookie!.maxAge).toBe(3600);
	});

	it("detects __Secure- and __Host- prefixes", () => {
		const [a, b] = parseCookies(["__Secure-id=x; Secure", "__Host-id=y; Secure; Path=/"]);
		expect(a!.hasSecurePrefix).toBe(true);
		expect(b!.hasHostPrefix).toBe(true);
	});

	it("returns an empty array for no Set-Cookie headers", () => {
		expect(parseCookies([])).toEqual([]);
	});
});

describe("analyzeCookies", () => {
	it("flags a missing Secure attribute over HTTPS", () => {
		const cookies = parseCookies(["session=abc; HttpOnly; SameSite=Lax"]);
		const findings = analyzeCookies(cookies, true);
		expect(findings.some(f => f.id === "cookie-session-not-secure")).toBe(true);
	});

	it("does not flag missing Secure over plain HTTP", () => {
		const cookies = parseCookies(["session=abc; HttpOnly; SameSite=Lax"]);
		const findings = analyzeCookies(cookies, false);
		expect(findings.some(f => f.id === "cookie-session-not-secure")).toBe(false);
	});

	it("flags a missing HttpOnly attribute", () => {
		const cookies = parseCookies(["session=abc; Secure; SameSite=Lax"]);
		const findings = analyzeCookies(cookies, true);
		expect(findings.some(f => f.id === "cookie-session-not-httponly")).toBe(true);
	});

	it("flags SameSite=None without Secure as HIGH", () => {
		const cookies = parseCookies(["session=abc; SameSite=None"]);
		const findings = analyzeCookies(cookies, true);
		const finding = findings.find(f => f.id === "cookie-session-samesite-none-insecure");
		expect(finding?.severity).toBe("HIGH");
	});

	it("passes a fully-secured cookie with no findings beyond the pass marker", () => {
		const cookies = parseCookies(["__Host-session=abc; Secure; HttpOnly; SameSite=Strict; Path=/"]);
		const findings = analyzeCookies(cookies, true);
		expect(findings).toHaveLength(1);
		expect(findings[0]!.severity).toBe("PASS");
	});

	it("reports informationally when no cookies are set at all", () => {
		const findings = analyzeCookies([], true);
		expect(findings[0]!.id).toBe("no-cookies-set");
	});
});
