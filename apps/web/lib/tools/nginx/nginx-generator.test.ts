import { describe, expect, it } from "vitest";

import { generateNginxConfig } from "./nginx-generator";
import { DEFAULT_NGINX_CONFIG, type NginxConfig } from "./types";

describe("generateNginxConfig", () => {
	it("generates a reverse proxy block matching the documented example", () => {
		const config: NginxConfig = {
			...DEFAULT_NGINX_CONFIG,
			mode: "reverse-proxy",
			serverName: "example.com",
			listenPort: 80,
			gzip: false,
			securityHeaders: { xContentTypeOptions: false, xFrameOptions: false, referrerPolicy: false },
			caching: { enabled: false, maxAgeDays: 30 },
		};

		const output = generateNginxConfig(config);

		expect(output).toContain("listen 80;");
		expect(output).toContain("server_name example.com;");
		expect(output).toContain("proxy_pass http://127.0.0.1:3000;");
		expect(output).toContain("proxy_set_header Host $host;");
		expect(output).toContain("proxy_set_header X-Real-IP $remote_addr;");
		expect(output).toContain("proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;");
		expect(output).toContain("proxy_set_header X-Forwarded-Proto $scheme;");
	});

	it("generates a static site block with root and try_files", () => {
		const config: NginxConfig = { ...DEFAULT_NGINX_CONFIG, mode: "static", root: "/var/www/html" };
		const output = generateNginxConfig(config);

		expect(output).toContain("root /var/www/html;");
		expect(output).toContain("try_files $uri $uri/ =404;");
		expect(output).not.toContain("proxy_pass");
	});

	it("generates an HTTPS block with a redirect from port 80", () => {
		const config: NginxConfig = { ...DEFAULT_NGINX_CONFIG, ssl: { ...DEFAULT_NGINX_CONFIG.ssl, enabled: true, redirectHttpToHttps: true } };
		const output = generateNginxConfig(config);

		expect(output).toContain("listen 80;");
		expect(output).toContain("return 301 https://$host$request_uri;");
		expect(output).toContain("listen 443 ssl;");
		expect(output).toContain(`ssl_certificate ${DEFAULT_NGINX_CONFIG.ssl.certPath};`);
		expect(output).toContain(`ssl_certificate_key ${DEFAULT_NGINX_CONFIG.ssl.keyPath};`);
		expect(output).not.toContain("ssl on;");
	});

	it("omits proxy headers that are turned off", () => {
		const config: NginxConfig = { ...DEFAULT_NGINX_CONFIG, proxyHeaders: { host: true, realIp: false, forwardedFor: false, forwardedProto: false } };
		const output = generateNginxConfig(config);

		expect(output).toContain("proxy_set_header Host $host;");
		expect(output).not.toContain("X-Real-IP");
	});

	it("produces deterministic output for the same config", () => {
		expect(generateNginxConfig(DEFAULT_NGINX_CONFIG)).toBe(generateNginxConfig(DEFAULT_NGINX_CONFIG));
	});
});
