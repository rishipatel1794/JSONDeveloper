import type { NginxConfig } from "./types";

const INDENT = "    ";

function securityHeaderLines(config: NginxConfig): string[] {
	const lines: string[] = [];
	if (config.securityHeaders.xContentTypeOptions) lines.push(`${INDENT}add_header X-Content-Type-Options "nosniff" always;`);
	if (config.securityHeaders.xFrameOptions) lines.push(`${INDENT}add_header X-Frame-Options "SAMEORIGIN" always;`);
	if (config.securityHeaders.referrerPolicy) lines.push(`${INDENT}add_header Referrer-Policy "strict-origin-when-cross-origin" always;`);
	return lines;
}

function gzipLines(config: NginxConfig): string[] {
	if (!config.gzip) return [];
	return [
		`${INDENT}gzip on;`,
		`${INDENT}gzip_vary on;`,
		`${INDENT}gzip_min_length 256;`,
		`${INDENT}gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/rss+xml font/woff2;`,
	];
}

function proxyLocationLines(config: NginxConfig): string[] {
	const lines = [`${INDENT}${INDENT}proxy_pass ${config.backendUrl};`, ""];

	if (config.proxyHeaders.host) lines.push(`${INDENT}${INDENT}proxy_set_header Host $host;`);
	if (config.proxyHeaders.realIp) lines.push(`${INDENT}${INDENT}proxy_set_header X-Real-IP $remote_addr;`);
	if (config.proxyHeaders.forwardedFor) lines.push(`${INDENT}${INDENT}proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`);
	if (config.proxyHeaders.forwardedProto) lines.push(`${INDENT}${INDENT}proxy_set_header X-Forwarded-Proto $scheme;`);

	return lines;
}

function staticLocationLines(config: NginxConfig): string[] {
	const lines = [`${INDENT}${INDENT}try_files $uri $uri/ =404;`];

	if (config.caching.enabled) {
		lines.push(
			"",
			`${INDENT}${INDENT}location ~* \\.(css|js|jpg|jpeg|png|gif|svg|webp|woff|woff2)$ {`,
			`${INDENT}${INDENT}${INDENT}expires ${config.caching.maxAgeDays}d;`,
			`${INDENT}${INDENT}${INDENT}add_header Cache-Control "public, immutable";`,
			`${INDENT}${INDENT}}`,
		);
	}

	return lines;
}

function buildServerBlock(config: NginxConfig, listenDirective: string[]): string {
	const lines: string[] = ["server {", ...listenDirective.map(line => `${INDENT}${line}`), `${INDENT}server_name ${config.serverName};`, ""];

	if (config.mode === "static") {
		lines.push(`${INDENT}root ${config.root};`, "");
	}

	const gzip = gzipLines(config);
	lines.push(...gzip);
	if (gzip.length > 0) lines.push("");

	const securityHeaders = securityHeaderLines(config);
	lines.push(...securityHeaders);
	if (securityHeaders.length > 0) lines.push("");

	lines.push(
		`${INDENT}location / {`,
		...(config.mode === "reverse-proxy" ? proxyLocationLines(config) : staticLocationLines(config)),
		`${INDENT}}`,
	);

	lines.push("}");

	return lines.join("\n");
}

/** Generates one or two nginx server blocks. Never emits `ssl on;` (removed in modern nginx) or wildcard proxy targets. */
export function generateNginxConfig(config: NginxConfig): string {
	const blocks: string[] = [];

	if (config.ssl.enabled) {
		if (config.ssl.redirectHttpToHttps) {
			blocks.push(
				["server {", `${INDENT}listen 80;`, `${INDENT}server_name ${config.serverName};`, "", `${INDENT}return 301 https://$host$request_uri;`, "}"].join(
					"\n",
				),
			);
		}

		blocks.push(
			buildServerBlock(config, [
				"listen 443 ssl;",
				"listen [::]:443 ssl;",
				`ssl_certificate ${config.ssl.certPath};`,
				`ssl_certificate_key ${config.ssl.keyPath};`,
			]),
		);
	} else {
		blocks.push(buildServerBlock(config, [`listen ${config.listenPort};`]));
	}

	return `${blocks.join("\n\n")}\n`;
}
