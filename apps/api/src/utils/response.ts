/** Response headers we don't forward — either irrelevant once JSON-wrapped, or potentially sensitive. */
const FORBIDDEN_RESPONSE_HEADERS = new Set(["set-cookie"]);

export function filterResponseHeaders(headers: Headers): Record<string, string> {
	const result: Record<string, string> = {};

	headers.forEach((value, key) => {
		const lowerKey = key.toLowerCase();
		if (FORBIDDEN_RESPONSE_HEADERS.has(lowerKey)) return;
		if (lowerKey.startsWith("x-internal-")) return;
		result[key] = value;
	});

	return result;
}

export interface ReadBodyResult {
	buffer: Buffer;
	truncated: boolean;
}

/**
 * Reads a response body up to a hard byte limit, cancelling the stream the moment it's exceeded.
 * Never buffers based on a trusted Content-Length header alone — a server can lie about it or omit
 * it entirely (chunked transfer), so this counts bytes as they actually arrive.
 */
export async function readBodyWithLimit(response: Response, maxBytes: number): Promise<ReadBodyResult> {
	const reader = response.body?.getReader();
	if (!reader) return { buffer: Buffer.alloc(0), truncated: false };

	const chunks: Uint8Array[] = [];
	let total = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		if (value) {
			total += value.byteLength;

			if (total > maxBytes) {
				await reader.cancel();
				return { buffer: Buffer.concat(chunks), truncated: true };
			}

			chunks.push(value);
		}
	}

	return { buffer: Buffer.concat(chunks), truncated: false };
}
