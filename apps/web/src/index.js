/**
 * Sits in front of the static asset deployment to: 301-redirect legacy hostnames and plain HTTP
 * requests to the canonical HTTPS domain (preserving path + query), and attach security headers
 * that `output: "export"` can't set itself (Next.js's `headers()` config is a documented no-op for
 * a static export — this Worker is the only place in production that actually runs per-request, so
 * it's the only place left that can add response headers). Otherwise falls through to the static
 * assets binding unchanged — none of this affects the Next.js build.
 *
 * The HTTP->HTTPS redirect isn't just theoretical: both this site's own Security Audit tool and a
 * Google Search Console export flagged plain-HTTP URLs being crawled and indexed as separate pages
 * from their HTTPS counterparts, splitting ranking signal for identical content. Cloudflare does not
 * upgrade this automatically without the zone's "Always Use HTTPS" setting (outside this repo), so
 * it has to happen here.
 */
const LEGACY_HOSTNAMES = new Set([
	"jsondeveloper.rishipatel1794.workers.dev",
	"www.jsondeveloper.com",
]);

/** Applied to every response, redirects included, so browsers pin HTTPS for this host either way. */
function withSecurityHeaders(response) {
	const headers = new Headers(response.headers);
	headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
	headers.set("X-Content-Type-Options", "nosniff");

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (LEGACY_HOSTNAMES.has(url.hostname) || url.protocol === "http:") {
			const destination = new URL("https://jsondeveloper.com");
			destination.pathname = url.pathname;
			destination.search = url.search;

			return withSecurityHeaders(Response.redirect(destination.toString(), 301));
		}

		return withSecurityHeaders(await env.ASSETS.fetch(request));
	},
};
