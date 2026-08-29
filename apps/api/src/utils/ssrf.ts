import { promises as dns } from "node:dns";
import net from "node:net";

/**
 * Blocks the outbound proxy from reaching private/internal network space.
 *
 * Deliberately resolves DNS and inspects the resulting IP addresses rather than pattern-matching
 * the hostname string — a hostname like "internal-service.example.com" can resolve straight to a
 * private IP, and string matching alone would miss that entirely.
 *
 * Known residual limitation: there is a small TOCTOU window between this resolution and the
 * connection fetch() makes internally (DNS rebinding could theoretically return a different IP at
 * connect time). Closing that fully requires pinning the resolved IP via a custom low-level
 * dispatcher, which was judged not worth a new dependency for V1. Not following redirects (see
 * request.service.ts) removes the largest practical exploitation path for that gap.
 */

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback","https://jsondeveloper-api-proxy.rishipatel1794.workers.dev/api/request"]);

function isIPv4PrivateOrReserved(ip: string): boolean {
	const parts = ip.split(".").map(Number);
	if (parts.length !== 4 || parts.some(part => Number.isNaN(part))) return true;

	const [a, b] = parts as [number, number, number, number];

	if (a === 127) return true; // loopback
	if (a === 10) return true; // private
	if (a === 172 && b >= 16 && b <= 31) return true; // private
	if (a === 192 && b === 168) return true; // private
	if (a === 169 && b === 254) return true; // link-local, includes cloud metadata (169.254.169.254)
	if (a === 0) return true; // "this network"
	if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT shared address space
	if (a >= 224) return true; // multicast (224-239) and reserved (240-255)

	return false;
}

function isIPv6PrivateOrReserved(ip: string): boolean {
	const normalized = ip.toLowerCase();

	if (normalized === "::1" || normalized === "::") return true; // loopback / unspecified
	if (normalized.startsWith("fe80:")) return true; // link-local
	if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local (fc00::/7)

	// IPv4-mapped IPv6 (::ffff:127.0.0.1) — check the embedded IPv4 address.
	const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);
	if (mapped?.[1]) return isIPv4PrivateOrReserved(mapped[1]);

	return false;
}

function isPrivateOrReservedIp(ip: string): boolean {
	if (net.isIPv4(ip)) return isIPv4PrivateOrReserved(ip);
	if (net.isIPv6(ip)) return isIPv6PrivateOrReserved(ip);
	return true; // Unrecognized format — block conservatively rather than guess.
}

export interface SsrfCheckResult {
	allowed: boolean;
	reason?: string;
}

export async function validateOutboundUrl(rawUrl: string, allowPrivateNetworks: boolean): Promise<SsrfCheckResult> {
	let url: URL;
	try {
		url = new URL(rawUrl);
	} catch {
		return { allowed: false, reason: "Please enter a valid HTTP or HTTPS URL." };
	}

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		return { allowed: false, reason: "Only http and https URLs are supported." };
	}

	if (allowPrivateNetworks) {
		return { allowed: true };
	}

	const hostname = url.hostname;

	if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) {
		return { allowed: false, reason: "Requests to local or internal hosts are not allowed." };
	}

	// A literal IP in the URL — validate it directly, no DNS involved.
	if (net.isIP(hostname)) {
		if (isPrivateOrReservedIp(hostname)) {
			return { allowed: false, reason: "Requests to private or reserved network addresses are not allowed." };
		}
		return { allowed: true };
	}

	try {
		const addresses = await dns.lookup(hostname, { all: true, verbatim: true });

		if (addresses.length === 0) {
			return { allowed: false, reason: "Unable to resolve the target host." };
		}

		for (const { address } of addresses) {
			if (isPrivateOrReservedIp(address)) {
				return { allowed: false, reason: "Requests to private or reserved network addresses are not allowed." };
			}
		}

		return { allowed: true };
	} catch {
		return { allowed: false, reason: "Unable to resolve the target host." };
	}
}
