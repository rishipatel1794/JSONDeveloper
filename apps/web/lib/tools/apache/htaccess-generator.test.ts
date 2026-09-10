import { describe, expect, it } from "vitest";

import { generateHtaccess } from "./htaccess-generator";
import { DEFAULT_APACHE_CONFIG, type ApacheConfig } from "./types";

const BLANK_CONFIG: ApacheConfig = {
	...DEFAULT_APACHE_CONFIG,
	forceHttps: false,
	disableDirectoryListing: false,
	defaultIndexFiles: "",
	browserCaching: false,
	gzipCompression: false,
	securityHeaders: { xContentTypeOptions: false, xFrameOptions: false, referrerPolicy: false, contentSecurityPolicy: false, contentSecurityPolicyValue: "" },
};

describe("generateHtaccess", () => {
	it("generates a force-HTTPS redirect", () => {
		const output = generateHtaccess({ ...BLANK_CONFIG, forceHttps: true });

		expect(output).toContain("RewriteEngine On");
		expect(output).toContain("RewriteCond %{HTTPS} !=on");
		expect(output).toContain("RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]");
	});

	it("generates a www redirect", () => {
		const output = generateHtaccess({ ...BLANK_CONFIG, wwwRedirect: "www-to-non-www" });
		expect(output).toContain("RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]");

		const reverse = generateHtaccess({ ...BLANK_CONFIG, wwwRedirect: "non-www-to-www" });
		expect(reverse).toContain("RewriteCond %{HTTP_HOST} !^www\\. [NC]");
	});

	it("only emits RewriteEngine On once even with multiple rewrite-based features", () => {
		const output = generateHtaccess({ ...BLANK_CONFIG, forceHttps: true, wwwRedirect: "www-to-non-www" });
		expect(output.match(/RewriteEngine On/g)).toHaveLength(1);
	});

	it("generates a custom redirect", () => {
		const output = generateHtaccess({ ...BLANK_CONFIG, redirects: [{ id: "1", type: "301", from: "/old-page", to: "/new-page" }] });
		expect(output).toContain("Redirect 301 /old-page /new-page");
	});

	it("skips incomplete custom redirects", () => {
		const output = generateHtaccess({ ...BLANK_CONFIG, redirects: [{ id: "1", type: "301", from: "", to: "/new-page" }] });
		expect(output).not.toContain("Redirect");
	});

	it("omits the CSP header unless a value is explicitly provided", () => {
		const withoutValue = generateHtaccess({
			...BLANK_CONFIG,
			securityHeaders: { ...BLANK_CONFIG.securityHeaders, contentSecurityPolicy: true, contentSecurityPolicyValue: "" },
		});
		expect(withoutValue).not.toContain("Content-Security-Policy");

		const withValue = generateHtaccess({
			...BLANK_CONFIG,
			securityHeaders: { ...BLANK_CONFIG.securityHeaders, contentSecurityPolicy: true, contentSecurityPolicyValue: "default-src 'self'" },
		});
		expect(withValue).toContain(`Content-Security-Policy "default-src 'self'"`);
	});

	it("returns an empty string when nothing is enabled", () => {
		expect(generateHtaccess(BLANK_CONFIG)).toBe("");
	});

	it("produces deterministic output for the same config", () => {
		const a = generateHtaccess(DEFAULT_APACHE_CONFIG);
		const b = generateHtaccess(DEFAULT_APACHE_CONFIG);
		expect(a).toBe(b);
	});
});
