import { isIPv4PrivateOrReserved, isIPv6PrivateOrReserved } from "../ssrf";

/**
 * A from-scratch, correct SSRF guard for this feature rather than a reuse of ../ssrf.ts's
 * `validateOutboundUrl`. That function has a real bug: its private/reserved-range check falls
 * through to `return true` for any hostname that's neither a bare IPv4 literal nor contains a colon —
 * i.e. it misclassifies ordinary domain names (like "example.com") as "private/reserved", which is
 * only survivable in production because the API Client's proxy config hardcodes
 * PROXY_ALLOW_PRIVATE_NETWORKS=true as an escape hatch. This feature has no legitimate reason to ever
 * target a private address (unlike the API Client, which developers use against their own local
 * services), so it never offers that escape hatch, and it resolves domain names itself via
 * DNS-over-HTTPS before ever fetching them, rather than only pattern-matching the literal hostname.
 */

const BLOCKED_HOSTNAME_SUFFIXES = [".local", ".internal", ".localhost"];

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback"]);

export interface SsrfCheckResult {
  allowed: boolean;
  reason?: string;
  resolvedAddresses?: string[];
}

function isIpLiteral(hostname: string): boolean {
  return /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.includes(":");
}

function isAddressPrivate(address: string): boolean {
  return address.includes(":") ? isIPv6PrivateOrReserved(address) : isIPv4PrivateOrReserved(address);
}

interface DohAnswer {
  type: number;
  data: string;
}

interface DohResponse {
  Answer?: DohAnswer[];
}

const DOH_TIMEOUT_MS = 3000;

/**
 * Resolves via Cloudflare's own DNS-over-HTTPS resolver — a plain fetch, since Workers has no `dns`
 * module. Bounded by its own short timeout: a single audit calls this several times (the main fetch,
 * each redirect hop, and the separate HTTP/HTTPS availability probes), and none of that was ever
 * covered by the caller's own abort signal — an unbounded DoH lookup here could silently eat most of
 * the overall request budget before the "real" fetch even starts, making a perfectly healthy target
 * look like it timed out.
 */
async function resolveViaDoh(hostname: string, recordType: "A" | "AAAA"): Promise<string[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DOH_TIMEOUT_MS);

  try {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${recordType}`, {
      headers: { Accept: "application/dns-json" },
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const data = (await response.json()) as DohResponse;
    const wantType = recordType === "A" ? 1 : 28; // DNS RR type numbers: A=1, AAAA=28

    return (data.Answer ?? []).filter(answer => answer.type === wantType).map(answer => answer.data);
  } finally {
    clearTimeout(timeoutId);
  }
}

interface CacheEntry {
  addresses: string[];
  expiresAt: number;
}

const RESOLUTION_CACHE_TTL_MS = 15_000;
const resolutionCache = new Map<string, CacheEntry>();

/**
 * A single audit resolves the same hostname repeatedly — the main fetch, each redirect hop, and the
 * separate http/https availability probes all target the same domain in the common case of zero
 * redirects. A short-lived cache cuts that down to one real DNS round trip per hostname per audit.
 * This does widen the DNS-rebinding TOCTOU window slightly (a cached "safe" result now covers up to
 * 15s of later fetches instead of being re-resolved immediately before each one) but that window was
 * already non-zero and documented above; 15s is short enough not to meaningfully change the risk while
 * being long enough to cover one audit's total duration.
 */
async function resolveHostname(hostname: string): Promise<string[]> {
  const cached = resolutionCache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.addresses;
  }

  const [ipv4, ipv6] = await Promise.all([resolveViaDoh(hostname, "A"), resolveViaDoh(hostname, "AAAA")]);
  const addresses = [...ipv4, ...ipv6];

  resolutionCache.set(hostname, { addresses, expiresAt: Date.now() + RESOLUTION_CACHE_TTL_MS });
  if (resolutionCache.size > 1000) {
    const now = Date.now();
    for (const [key, entry] of resolutionCache) {
      if (entry.expiresAt <= now) resolutionCache.delete(key);
    }
  }

  return addresses;
}

/**
 * Validates a user-supplied audit target before it's ever fetched. For a domain name, this resolves
 * it via DNS-over-HTTPS and rejects it if *any* resolved address is private/reserved — this narrows
 * the DNS-rebinding window considerably (a hostname that plainly resolves to an internal address is
 * caught immediately) but can't close it completely, since the name could re-resolve differently by
 * the time the real fetch happens moments later. No environment without raw socket-level control can
 * close that TOCTOU gap entirely, including a traditional Node server doing its own dns.lookup — the
 * mitigation here is catching the overwhelmingly common case, combined with re-validating every
 * redirect hop (see fetchWithGuard in service.ts) rather than trusting only the initial hostname.
 */
export async function validateAuditTargetUrl(rawUrl: string): Promise<SsrfCheckResult> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: "Please enter a valid HTTP or HTTPS URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { allowed: false, reason: "Only HTTP and HTTPS URLs are supported." };
  }

  if (url.username || url.password) {
    return { allowed: false, reason: "URLs containing embedded credentials are not allowed." };
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOSTNAME_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
    return { allowed: false, reason: "Requests to local or internal hosts are not allowed." };
  }

  if (isIpLiteral(hostname)) {
    const bare = hostname.replace(/^\[|\]$/g, "");

    if (isAddressPrivate(bare)) {
      return { allowed: false, reason: "Requests to private or reserved network addresses are not allowed." };
    }

    return { allowed: true, resolvedAddresses: [bare] };
  }

  let addresses: string[];

  try {
    addresses = await resolveHostname(hostname);
  } catch {
    return { allowed: false, reason: "Could not resolve this hostname." };
  }

  if (addresses.length === 0) {
    return { allowed: false, reason: "Could not resolve this hostname." };
  }

  if (addresses.some(isAddressPrivate)) {
    return { allowed: false, reason: "This hostname resolves to a private or reserved network address." };
  }

  return { allowed: true, resolvedAddresses: addresses };
}
