/**
 * Sits in front of the static asset deployment purely to 301-redirect legacy hostnames to the
 * canonical domain, preserving the path and query string. Everything else falls through to the
 * static assets binding unchanged — this has no effect on the Next.js build or `output: "export"`.
 */
const LEGACY_HOSTNAMES = new Set([
	"jsondeveloper.rishipatel1794.workers.dev",
	"www.jsondeveloper.com",
]);

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (LEGACY_HOSTNAMES.has(url.hostname)) {
			const destination = new URL("https://jsondeveloper.com");
			destination.pathname = url.pathname;
			destination.search = url.search;

			return Response.redirect(destination.toString(), 301);
		}

		return env.ASSETS.fetch(request);
	},
};
