import { afterEach, describe, expect, it, vi } from "vitest";

import { validateAuditTargetUrl } from "./ssrfGuard";

function dohResponse(records: { type: number; data: string }[]) {
	return new Response(JSON.stringify({ Answer: records }), { status: 200, headers: { "content-type": "application/dns-json" } });
}

describe("validateAuditTargetUrl", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("rejects non-HTTP(S) protocols", async () => {
		const result = await validateAuditTargetUrl("ftp://example.com");
		expect(result.allowed).toBe(false);
	});

	it("rejects malformed URLs", async () => {
		const result = await validateAuditTargetUrl("not a url");
		expect(result.allowed).toBe(false);
	});

	it("rejects URLs with embedded credentials", async () => {
		const result = await validateAuditTargetUrl("https://user:pass@example.com");
		expect(result.allowed).toBe(false);
	});

	it("rejects localhost by name", async () => {
		const result = await validateAuditTargetUrl("http://localhost:3000/");
		expect(result.allowed).toBe(false);
	});

	it("rejects .internal and .local suffixes", async () => {
		expect((await validateAuditTargetUrl("http://service.internal")).allowed).toBe(false);
		expect((await validateAuditTargetUrl("http://printer.local")).allowed).toBe(false);
	});

	describe("IP literals", () => {
		it("rejects loopback (127.0.0.1)", async () => {
			expect((await validateAuditTargetUrl("http://127.0.0.1/")).allowed).toBe(false);
		});

		it("rejects link-local / cloud metadata (169.254.169.254)", async () => {
			expect((await validateAuditTargetUrl("http://169.254.169.254/")).allowed).toBe(false);
		});

		it("rejects RFC1918 private ranges", async () => {
			expect((await validateAuditTargetUrl("http://10.0.0.1/")).allowed).toBe(false);
			expect((await validateAuditTargetUrl("http://172.16.0.1/")).allowed).toBe(false);
			expect((await validateAuditTargetUrl("http://192.168.1.1/")).allowed).toBe(false);
		});

		it("rejects IPv6 loopback and unique-local", async () => {
			expect((await validateAuditTargetUrl("http://[::1]/")).allowed).toBe(false);
			expect((await validateAuditTargetUrl("http://[fd00::1]/")).allowed).toBe(false);
		});

		it("allows a public IP literal without requiring DNS", async () => {
			const fetchSpy = vi.spyOn(global, "fetch");
			const result = await validateAuditTargetUrl("http://93.184.216.34/");
			expect(result.allowed).toBe(true);
			expect(fetchSpy).not.toHaveBeenCalled();
		});
	});

	describe("domain names (DNS-over-HTTPS resolution)", () => {
		it("allows a domain that resolves only to public addresses", async () => {
			// A fresh Response per call — the A and AAAA lookups run in parallel and each reads its own
			// response body via .json(), which can only happen once per Response instance.
			vi.spyOn(global, "fetch").mockImplementation(async () => dohResponse([{ type: 1, data: "93.184.216.34" }]));
			const result = await validateAuditTargetUrl("https://example.com");
			expect(result.allowed).toBe(true);
			expect(result.resolvedAddresses).toContain("93.184.216.34");
		});

		it("rejects a domain that resolves to a private address (DNS rebinding case)", async () => {
			vi.spyOn(global, "fetch").mockImplementation(async () => dohResponse([{ type: 1, data: "127.0.0.1" }]));
			const result = await validateAuditTargetUrl("https://rebind.example.com");
			expect(result.allowed).toBe(false);
		});

		it("rejects a domain that resolves to a cloud metadata address", async () => {
			vi.spyOn(global, "fetch").mockImplementation(async () => dohResponse([{ type: 1, data: "169.254.169.254" }]));
			const result = await validateAuditTargetUrl("https://metadata.example.com");
			expect(result.allowed).toBe(false);
		});

		it("rejects a domain with no DNS records at all", async () => {
			vi.spyOn(global, "fetch").mockImplementation(async () => dohResponse([]));
			const result = await validateAuditTargetUrl("https://nonexistent.example.invalid");
			expect(result.allowed).toBe(false);
		});

		it("fails closed if DNS resolution itself errors", async () => {
			vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));
			// A distinct hostname from the other cases in this block — the resolution cache is
			// module-scoped and shared across tests, so reusing "example.com" here would silently
			// hit the cache entry populated by the earlier passing-case test instead of exercising fetch.
			const result = await validateAuditTargetUrl("https://dns-error.example.com");
			expect(result.allowed).toBe(false);
		});
	});
});
