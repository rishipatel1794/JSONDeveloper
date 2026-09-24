/**
 * Per-isolate, in-memory sliding-window rate limiter.
 *
 * This is a deliberate V1 tradeoff, not an oversight: this Worker has no shared persistence today
 * (no KV namespace, no Durable Object binding), and provisioning one is a real infrastructure change
 * with its own setup that shouldn't happen as a side effect of this feature. An in-memory counter is
 * scoped to a single Worker isolate, so a client hitting different Cloudflare edge locations could
 * exceed the nominal limit — the same accepted limitation already documented for apps/api's own
 * express-rate-limit setup ("sufficient for a single-instance V1... a distributed deployment should
 * swap the store for a shared one"). If this needs to be airtight later, move it to Cloudflare KV or a
 * Durable Object.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

/** Clears entries untouched for 5+ minutes so this map can't grow unbounded over a long-lived isolate. */
function pruneStaleClients(now: number): void {
  for (const [key, timestamps] of hits) {
    if (timestamps.length === 0 || now - timestamps[timestamps.length - 1]! > 300_000) {
      hits.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(clientKey: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const existing = (hits.get(clientKey) ?? []).filter(timestamp => timestamp > windowStart);

  if (existing.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((existing[0]! + WINDOW_MS - now) / 1000);
    hits.set(clientKey, existing);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  existing.push(now);
  hits.set(clientKey, existing);

  if (hits.size > 10_000) pruneStaleClients(now);

  return { allowed: true };
}
