const BLOCKED_RESPONSE_HEADERS = new Set([
  "set-cookie",
  "set-cookie2",
  "www-authenticate",
]);

export function filterResponseHeaders(
  headers: Headers,
): Record<string, string> {
  const result: Record<string, string> = {};

  headers.forEach((value, key) => {
    if (!BLOCKED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      result[key] = value;
    }
  });

  return result;
}