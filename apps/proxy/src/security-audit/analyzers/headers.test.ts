import { describe, expect, it } from "vitest";

import { analyzeClickjacking, analyzeHsts, analyzeXContentTypeOptions, getCspHeaderFinding } from "./headers";

describe("analyzeHsts", () => {
	it("flags HSTS as not applicable over plain HTTP", () => {
		const findings = analyzeHsts(new Headers(), false);
		expect(findings[0]!.id).toBe("hsts-not-applicable");
		expect(findings[0]!.severity).toBe("INFO");
	});

	it("flags missing HSTS over HTTPS as MEDIUM", () => {
		const findings = analyzeHsts(new Headers(), true);
		expect(findings[0]!.id).toBe("missing-hsts");
		expect(findings[0]!.severity).toBe("MEDIUM");
	});

	it("flags a too-short max-age as LOW", () => {
		const headers = new Headers({ "strict-transport-security": "max-age=3600" });
		const findings = analyzeHsts(headers, true);
		expect(findings[0]!.id).toBe("weak-hsts-max-age");
		expect(findings[0]!.severity).toBe("LOW");
	});

	it("passes a strong HSTS config", () => {
		const headers = new Headers({ "strict-transport-security": "max-age=31536000; includeSubDomains; preload" });
		const findings = analyzeHsts(headers, true);
		expect(findings[0]!.id).toBe("hsts-present");
		expect(findings[0]!.severity).toBe("PASS");
	});
});

describe("analyzeXContentTypeOptions", () => {
	it("passes when nosniff is set", () => {
		const finding = analyzeXContentTypeOptions(new Headers({ "x-content-type-options": "nosniff" }));
		expect(finding.severity).toBe("PASS");
	});

	it("flags when missing", () => {
		const finding = analyzeXContentTypeOptions(new Headers());
		expect(finding.severity).toBe("LOW");
	});
});

describe("analyzeClickjacking", () => {
	it("passes via CSP frame-ancestors even with no X-Frame-Options", () => {
		const finding = analyzeClickjacking(new Headers(), "'self'");
		expect(finding.id).toBe("clickjacking-protected-csp");
		expect(finding.severity).toBe("PASS");
	});

	it("passes via a recognized X-Frame-Options value", () => {
		const finding = analyzeClickjacking(new Headers({ "x-frame-options": "SAMEORIGIN" }), null);
		expect(finding.id).toBe("clickjacking-protected-xfo");
	});

	it("flags an unrecognized X-Frame-Options value as only partial", () => {
		const finding = analyzeClickjacking(new Headers({ "x-frame-options": "ALLOW-FROM https://example.com" }), null);
		expect(finding.id).toBe("clickjacking-partial");
	});

	it("flags no protection at all as MEDIUM", () => {
		const finding = analyzeClickjacking(new Headers(), null);
		expect(finding.id).toBe("clickjacking-not-detected");
		expect(finding.severity).toBe("MEDIUM");
	});
});

describe("getCspHeaderFinding", () => {
	it("flags a missing CSP as HIGH", () => {
		const { value, finding } = getCspHeaderFinding(new Headers());
		expect(value).toBeNull();
		expect(finding?.severity).toBe("HIGH");
	});

	it("flags report-only CSP as MEDIUM and still returns the value", () => {
		const { value, finding } = getCspHeaderFinding(new Headers({ "content-security-policy-report-only": "default-src 'self'" }));
		expect(value).toBe("default-src 'self'");
		expect(finding?.id).toBe("csp-report-only");
	});

	it("returns no finding when an enforcing CSP is present", () => {
		const { value, finding } = getCspHeaderFinding(new Headers({ "content-security-policy": "default-src 'self'" }));
		expect(value).toBe("default-src 'self'");
		expect(finding).toBeNull();
	});
});
