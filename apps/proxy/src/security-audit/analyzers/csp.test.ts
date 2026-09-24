import { describe, expect, it } from "vitest";

import { analyzeCsp, getCspFrameAncestors, parseCspDirectives } from "./csp";

describe("parseCspDirectives", () => {
	it("parses multiple directives", () => {
		const result = parseCspDirectives("default-src 'self'; script-src 'self' https://cdn.example.com");
		expect(result.get("default-src")).toEqual(["'self'"]);
		expect(result.get("script-src")).toEqual(["'self'", "https://cdn.example.com"]);
	});
});

describe("getCspFrameAncestors", () => {
	it("returns the directive's value when present", () => {
		expect(getCspFrameAncestors("default-src 'self'; frame-ancestors 'self'")).toBe("'self'");
	});

	it("returns null when absent", () => {
		expect(getCspFrameAncestors("default-src 'self'")).toBeNull();
	});
});

describe("analyzeCsp", () => {
	it("flags unsafe-inline in script-src", () => {
		const findings = analyzeCsp("script-src 'self' 'unsafe-inline'");
		expect(findings.some(f => f.id.includes("unsafeinline"))).toBe(true);
	});

	it("flags unsafe-eval", () => {
		const findings = analyzeCsp("script-src 'self' 'unsafe-eval'");
		expect(findings.some(f => f.id.includes("unsafeeval"))).toBe(true);
	});

	it("flags a wildcard source", () => {
		const findings = analyzeCsp("img-src *");
		expect(findings.some(f => f.id === "csp-img-src-")).toBe(true);
	});

	it("flags missing default-src and script-src together", () => {
		const findings = analyzeCsp("img-src 'self'");
		expect(findings.some(f => f.id === "csp-no-default-or-script-src")).toBe(true);
	});

	it("passes a strict, reasonable policy with no findings beyond the pass marker", () => {
		const findings = analyzeCsp("default-src 'self'; object-src 'none'");
		expect(findings).toHaveLength(1);
		expect(findings[0]!.severity).toBe("PASS");
	});
});
