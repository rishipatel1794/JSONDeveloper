import type { ApacheConfig } from "./types";

const CACHED_EXTENSIONS = [
	["image/jpg", "jpg"],
	["image/jpeg", "jpeg"],
	["image/gif", "gif"],
	["image/png", "png"],
	["image/svg+xml", "svg"],
	["image/webp", "webp"],
	["text/css", "css"],
	["application/javascript", "js"],
	["font/woff", "woff"],
	["font/woff2", "woff2"],
] as const;

function buildRewriteSection(config: ApacheConfig): string | null {
	const rules: string[] = [];

	if (config.forceHttps) {
		rules.push("# Force HTTPS", "RewriteCond %{HTTPS} !=on", "RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]", "");
	}

	if (config.wwwRedirect === "www-to-non-www") {
		rules.push(
			"# Redirect www to non-www",
			"RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]",
			"RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]",
			"",
		);
	} else if (config.wwwRedirect === "non-www-to-www") {
		rules.push(
			"# Redirect non-www to www",
			"RewriteCond %{HTTP_HOST} !^www\\. [NC]",
			"RewriteRule ^ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]",
			"",
		);
	}

	if (rules.length === 0) return null;

	return ["RewriteEngine On", "", ...rules].join("\n").trimEnd();
}

function buildRedirectsSection(config: ApacheConfig): string | null {
	const valid = config.redirects.filter(redirect => redirect.from.trim() && redirect.to.trim());
	if (valid.length === 0) return null;

	return ["# Custom redirects", ...valid.map(redirect => `Redirect ${redirect.type} ${redirect.from.trim()} ${redirect.to.trim()}`)].join("\n");
}

function buildCachingSection(config: ApacheConfig): string | null {
	if (!config.browserCaching) return null;

	const expiresLines = CACHED_EXTENSIONS.map(([mime]) => `  ExpiresByType ${mime} "access plus ${config.cacheMaxAgeDays} days"`);
	const extensionPattern = CACHED_EXTENSIONS.map(([, ext]) => ext).join("|");

	return [
		"# Browser caching for static assets",
		"<IfModule mod_expires.c>",
		"  ExpiresActive On",
		...expiresLines,
		"</IfModule>",
		"<IfModule mod_headers.c>",
		`  <FilesMatch "\\.(${extensionPattern})$">`,
		`    Header set Cache-Control "public, max-age=${config.cacheMaxAgeDays * 86400}, immutable"`,
		"  </FilesMatch>",
		"</IfModule>",
	].join("\n");
}

function buildCompressionSection(config: ApacheConfig): string | null {
	const blocks: string[] = [];

	if (config.gzipCompression) {
		blocks.push(
			[
				"<IfModule mod_deflate.c>",
				"  AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript",
				"  AddOutputFilterByType DEFLATE application/xml application/xhtml+xml application/rss+xml",
				"  AddOutputFilterByType DEFLATE application/javascript application/x-javascript application/json application/font-woff",
				"</IfModule>",
			].join("\n"),
		);
	}

	if (config.brotliCompression) {
		blocks.push(
			[
				"# Requires mod_brotli, which isn't enabled on every host — gzip above is the safer, more widely supported default.",
				"<IfModule mod_brotli.c>",
				"  AddOutputFilterByType BROTLI_COMPRESS text/plain text/html text/xml text/css text/javascript application/javascript application/json",
				"</IfModule>",
			].join("\n"),
		);
	}

	if (blocks.length === 0) return null;
	return ["# Compression", ...blocks].join("\n");
}

function buildSecurityHeadersSection(config: ApacheConfig): string | null {
	const { securityHeaders } = config;
	const lines: string[] = [];

	if (securityHeaders.xContentTypeOptions) lines.push('  Header always set X-Content-Type-Options "nosniff"');
	if (securityHeaders.xFrameOptions) lines.push('  Header always set X-Frame-Options "SAMEORIGIN"');
	if (securityHeaders.referrerPolicy) lines.push('  Header always set Referrer-Policy "strict-origin-when-cross-origin"');
	if (securityHeaders.contentSecurityPolicy && securityHeaders.contentSecurityPolicyValue.trim()) {
		lines.push(`  Header always set Content-Security-Policy "${securityHeaders.contentSecurityPolicyValue.trim()}"`);
	}

	if (lines.length === 0) return null;
	return ["# Security headers", "<IfModule mod_headers.c>", ...lines, "</IfModule>"].join("\n");
}

/** Generates a conservative .htaccess file — no directive here can lock a visitor or admin out of the site. */
export function generateHtaccess(config: ApacheConfig): string {
	const sections: (string | null)[] = [
		buildRewriteSection(config),
		buildRedirectsSection(config),
		config.disableDirectoryListing ? ["# Disable directory listing", "Options -Indexes"].join("\n") : null,
		config.defaultIndexFiles.trim() ? ["# Default index file(s)", `DirectoryIndex ${config.defaultIndexFiles.trim()}`].join("\n") : null,
		buildCompressionSection(config),
		buildCachingSection(config),
		buildSecurityHeadersSection(config),
		config.customDirectives.trim() ? ["# Custom directives", config.customDirectives.trim()].join("\n") : null,
	];

	const output = sections.filter((section): section is string => Boolean(section)).join("\n\n");
	return output ? `${output}\n` : "";
}
