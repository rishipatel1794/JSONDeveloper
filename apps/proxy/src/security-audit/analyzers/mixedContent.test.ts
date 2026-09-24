import { describe, expect, it } from "vitest";

import { analyzeMixedContentAndHtml } from "./mixedContent";

const PAGE_URL = "https://example.com/";

describe("analyzeMixedContentAndHtml", () => {
	it("detects HTTP script/style/image resources on an HTTPS page", () => {
		const html = `
			<script src="http://example.com/a.js"></script>
			<link rel="stylesheet" href="http://example.com/a.css">
			<img src="http://example.com/a.png">
		`;
		const findings = analyzeMixedContentAndHtml(html, true, PAGE_URL);
		const finding = findings.find(f => f.id === "mixed-content-found");
		expect(finding).toBeDefined();
		expect((finding!.evidence as { count: number }).count).toBe(3);
	});

	it("reports no mixed content when everything is HTTPS", () => {
		const html = `<script src="https://example.com/a.js"></script>`;
		const findings = analyzeMixedContentAndHtml(html, true, PAGE_URL);
		expect(findings.some(f => f.id === "no-mixed-content")).toBe(true);
	});

	it("does not run mixed-content checks at all on a plain HTTP page", () => {
		const html = `<script src="http://example.com/a.js"></script>`;
		const findings = analyzeMixedContentAndHtml(html, false, "http://example.com/");
		expect(findings.some(f => f.id === "mixed-content-found" || f.id === "no-mixed-content")).toBe(false);
	});

	it("flags a password form submitting over HTTP as HIGH", () => {
		const html = `<form action="http://example.com/login"><input type="password" name="p"></form>`;
		const findings = analyzeMixedContentAndHtml(html, true, PAGE_URL);
		const finding = findings.find(f => f.id === "password-form-over-http");
		expect(finding?.severity).toBe("HIGH");
	});

	it("flags a non-password form over HTTP as MEDIUM, not HIGH", () => {
		const html = `<form action="http://example.com/search"><input type="text" name="q"></form>`;
		const findings = analyzeMixedContentAndHtml(html, true, PAGE_URL);
		const finding = findings.find(f => f.id === "form-over-http");
		expect(finding?.severity).toBe("MEDIUM");
	});

	it("counts inline scripts", () => {
		const html = `<script>console.log("hi")</script>`;
		const findings = analyzeMixedContentAndHtml(html, true, PAGE_URL);
		expect(findings.some(f => f.id === "inline-scripts-present")).toBe(true);
	});

	it("identifies third-party script hosts, excluding same-origin scripts", () => {
		const html = `
			<script src="https://cdn.thirdparty.com/lib.js"></script>
			<script src="https://example.com/own.js"></script>
		`;
		const findings = analyzeMixedContentAndHtml(html, true, PAGE_URL);
		const finding = findings.find(f => f.id === "third-party-scripts");
		expect((finding!.evidence as { hosts: string[] }).hosts).toEqual(["cdn.thirdparty.com"]);
	});
});
