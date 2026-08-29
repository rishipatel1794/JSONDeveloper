const BLOCKED_REQUEST_HEADERS = new Set([
  "host",
  "content-length",
  "connection",
  "transfer-encoding",
  "upgrade",
]);

export function buildOutboundHeaders(
  inputHeaders: unknown,
): Headers {
  const headers = new Headers();

  if (!Array.isArray(inputHeaders)) {
    return headers;
  }

  for (const item of inputHeaders) {
    if (
      !item ||
      typeof item !== "object" ||
      !("key" in item) ||
      !("value" in item)
    ) {
      continue;
    }

    const key = String(item.key).trim();

    if (!key || BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) {
      continue;
    }

    const enabled =
      !("enabled" in item) || Boolean(item.enabled);

    if (!enabled) {
      continue;
    }

    headers.set(key, String(item.value ?? ""));
  }

  return headers;
}