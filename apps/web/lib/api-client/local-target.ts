const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function isPrivateIPv4(hostname: string): boolean {
	const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
	if (!match) return false;

	const octets = match.slice(1, 5).map(Number);
	if (octets.some(octet => octet > 255)) return false;
	const [a, b] = octets as [number, number, number, number];

	if (a === 10) return true;
	if (a === 127) return true;
	if (a === 172 && b >= 16 && b <= 31) return true;
	if (a === 192 && b === 168) return true;
	if (a === 169 && b === 254) return true;

	return false;
}

/**
 * True for `localhost`, loopback, and private-network (RFC 1918 / link-local) hosts — the targets a
 * remote proxy (Cloudflare Worker or otherwise) can never reach, because they only mean anything on
 * the machine actually making the request. For these, the API Client calls the target directly from
 * the browser instead of relaying through the proxy, since the browser *is* that machine.
 *
 * This is a routing heuristic, not a security boundary — the proxy's own SSRF validation is what
 * actually guards server-side requests to internal addresses.
 */
export function isLocalOrPrivateTarget(rawUrl: string): boolean {
	try {
		// `URL#hostname` keeps the brackets for an IPv6 literal (e.g. "[::1]") — strip them for comparison.
		const hostname = new URL(rawUrl).hostname.toLowerCase().replace(/^\[|\]$/g, "");
		return LOCAL_HOSTNAMES.has(hostname) || isPrivateIPv4(hostname);
	} catch {
		return false;
	}
}
