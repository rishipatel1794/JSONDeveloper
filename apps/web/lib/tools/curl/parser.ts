import type { AuthConfig, CurlParseResult, CurlRequest, HttpMethod } from "./types";
import { createKeyValuePair, defaultCurlRequest } from "./utils";

const PARSE_ERROR = "Unable to parse this cURL command. We support common cURL request formats.";

/**
 * Shell-aware tokenizer: handles single/double-quoted segments, backslash escapes, and
 * backslash-newline line continuations. Not a full POSIX shell grammar — just enough for
 * the cURL commands developers commonly paste from docs, browser dev tools, or Postman.
 */
function tokenize(command: string): string[] {
	const joined = command.replace(/\\\r?\n\s*/g, " ");
	const tokens: string[] = [];
	let i = 0;
	const n = joined.length;

	while (i < n) {
		while (i < n && /\s/.test(joined[i] ?? "")) i++;
		if (i >= n) break;

		let token = "";

		while (i < n && !/\s/.test(joined[i] ?? "")) {
			const ch = joined[i];

			if (ch === "'") {
				i++;
				while (i < n && joined[i] !== "'") {
					token += joined[i];
					i++;
				}
				i++;
				continue;
			}

			if (ch === '"') {
				i++;
				while (i < n && joined[i] !== '"') {
					const current = joined[i];
					const nextChar = joined[i + 1];
					if (current === "\\" && nextChar !== undefined && ['"', "\\", "$", "`"].includes(nextChar)) {
						token += nextChar;
						i += 2;
					} else {
						token += current;
						i++;
					}
				}
				i++;
				continue;
			}

			if (ch === "\\" && i + 1 < n) {
				token += joined[i + 1];
				i += 2;
				continue;
			}

			token += ch;
			i++;
		}

		tokens.push(token);
	}

	return tokens;
}

export function parseCurl(command: string): CurlParseResult {
	if (!command.trim()) {
		return { success: false, error: "Please paste a cURL command to import." };
	}

	try {
		const tokens = tokenize(command);
		if (tokens.length === 0) return { success: false, error: PARSE_ERROR };

		let idx = tokens[0] === "curl" ? 1 : 0;

		const result: CurlRequest = defaultCurlRequest();
		result.url = "";

		const bodyParts: string[] = [];
		let sawUrl = false;

		while (idx < tokens.length) {
			const token = tokens[idx];

			switch (token) {
				case "-X":
				case "--request":
					result.method = ((tokens[++idx] ?? "GET").toUpperCase() as HttpMethod) || "GET";
					break;

				case "--url":
					result.url = tokens[++idx] ?? "";
					sawUrl = true;
					break;

				case "-H":
				case "--header": {
					const headerVal = tokens[++idx] ?? "";
					const sep = headerVal.indexOf(":");
					if (sep > -1) {
						result.headers.push(createKeyValuePair(headerVal.slice(0, sep).trim(), headerVal.slice(sep + 1).trim()));
					}
					break;
				}

				case "-d":
				case "--data":
				case "--data-raw":
				case "--data-binary":
					bodyParts.push(tokens[++idx] ?? "");
					result.bodyType = "raw";
					break;

				case "--data-urlencode": {
					const kv = tokens[++idx] ?? "";
					const eq = kv.indexOf("=");
					if (eq > -1) result.formData.push(createKeyValuePair(kv.slice(0, eq), kv.slice(eq + 1)));
					result.bodyType = "form-urlencoded";
					break;
				}

				case "-F":
				case "--form": {
					const kv = tokens[++idx] ?? "";
					const eq = kv.indexOf("=");
					if (eq > -1) {
						const rawValue = kv.slice(eq + 1);
						const isFile = rawValue.startsWith("@");
						result.formData.push(createKeyValuePair(kv.slice(0, eq), isFile ? rawValue.slice(1) : rawValue, isFile ? "file" : "text"));
					}
					result.bodyType = "multipart";
					break;
				}

				case "-u":
				case "--user": {
					const cred = tokens[++idx] ?? "";
					const sep = cred.indexOf(":");
					result.auth =
						sep > -1
							? { type: "basic", username: cred.slice(0, sep), password: cred.slice(sep + 1) }
							: { type: "basic", username: cred, password: "" };
					break;
				}

				case "-b":
				case "--cookie":
					result.cookies = tokens[++idx] ?? "";
					break;

				case "-A":
				case "--user-agent":
					result.userAgent = tokens[++idx] ?? "";
					break;

				case "-k":
				case "--insecure":
					result.insecure = true;
					break;

				case "-L":
				case "--location":
					result.followRedirects = true;
					break;

				case "--compressed":
					result.compressed = true;
					break;

				default:
					if (!sawUrl && token !== undefined && !token.startsWith("-") && /^https?:\/\//i.test(token)) {
						result.url = token;
						sawUrl = true;
					}
					break;
			}

			idx++;
		}

		if (!result.url) {
			return { success: false, error: PARSE_ERROR };
		}

		if (bodyParts.length > 0 && result.bodyType === "raw") {
			const combined = bodyParts.join("");
			result.body = combined;
			result.bodyType = isJsonLike(combined) ? "json" : "raw";
		}

		extractQueryParams(result);
		recognizeBearerAuth(result);

		return { success: true, data: result };
	} catch {
		return { success: false, error: PARSE_ERROR };
	}
}

function isJsonLike(value: string): boolean {
	try {
		JSON.parse(value);
		return true;
	} catch {
		return false;
	}
}

function extractQueryParams(result: CurlRequest): void {
	try {
		const url = new URL(result.url);
		url.searchParams.forEach((value, key) => {
			result.queryParams.push(createKeyValuePair(key, value));
		});
		url.search = "";
		result.url = url.toString();
	} catch {
		// Not a fully-qualified URL — leave it as-is rather than failing the whole import.
	}
}

function recognizeBearerAuth(result: CurlRequest): void {
	if (result.auth.type !== "none") return;

	const authHeaderIndex = result.headers.findIndex(header => header.key.toLowerCase() === "authorization");
	if (authHeaderIndex === -1) return;

	const header = result.headers[authHeaderIndex];
	if (!header) return;

	const match = /^Bearer\s+(.+)$/i.exec(header.value);
	if (match?.[1]) {
		result.auth = { type: "bearer", token: match[1] } satisfies AuthConfig;
		result.headers.splice(authHeaderIndex, 1);
	}
}
