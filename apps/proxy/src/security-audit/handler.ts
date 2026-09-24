import { z } from "zod";

import { checkRateLimit } from "./rateLimiter";
import { runSecurityAudit } from "./service";

const requestSchema = z.object({
  url: z.string().trim().min(1).max(2048),
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/**
 * Best-effort client identity for rate limiting — cf-connecting-ip is the real client IP as seen by
 * Cloudflare's edge (not spoofable the way a plain X-Forwarded-For could be, since Cloudflare sets it
 * itself). Falls back to a constant bucket if it's ever absent (e.g. local `wrangler dev`), which just
 * means local testing shares one rate-limit bucket rather than being unlimited.
 */
function getClientKey(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "unknown";
}

export async function handleSecurityAuditRequest(request: Request): Promise<Response> {
  const rateLimit = checkRateLimit(getClientKey(request));
  if (!rateLimit.allowed) {
    return jsonResponse(
      { error: "Too many audits from this address. Please wait a moment and try again." },
      429,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request body." }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Please enter a valid HTTP or HTTPS URL." }, 400);
  }

  const result = await runSecurityAudit(parsed.data.url);

  if ("error" in result) {
    return jsonResponse(result, 422);
  }

  return jsonResponse(result, 200);
}
