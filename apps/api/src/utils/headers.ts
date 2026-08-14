/**
 * Headers a client must never be able to set on the outbound request — either because fetch/undici
 * needs to manage them itself (Host, Content-Length), or because they could be used to smuggle
 * requests through the proxy or reach internal infrastructure (Proxy-Authorization, Connection).
 */
const FORBIDDEN_OUTBOUND_HEADERS = new Set([
	"host",
	"content-length",
	"connection",
	"transfer-encoding",
	"proxy-authorization",
	"proxy-connection",
	"upgrade",
	"keep-alive",
	"te",
	"trailer",
	"expect",
]);

export interface HeaderInput {
	key: string;
	value: string;
	enabled: boolean;
}

/** Builds a safe outbound Headers object from user-supplied key/value pairs. */
export function buildOutboundHeaders(headers: HeaderInput[]): Headers {
	const result = new Headers();

	for (const header of headers) {
		if (!header.enabled) continue;

		const key = header.key.trim();
		if (!key) continue;
		if (FORBIDDEN_OUTBOUND_HEADERS.has(key.toLowerCase())) continue;

		// Defense in depth against header/request smuggling via literal CR/LF, even though the
		// Headers API itself already rejects invalid values.
		if (/[\r\n]/.test(key) || /[\r\n]/.test(header.value)) continue;

		try {
			result.set(key, header.value);
		} catch {
			// Headers.set throws on a genuinely invalid header name/value — skip it, don't crash the request.
		}
	}

	return result;
}
