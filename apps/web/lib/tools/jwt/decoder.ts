import { base64UrlDecode } from "./utils";
import type { JwtDecodeResult, JwtHeader, JwtPayload } from "./types";

function parseJsonObject(json: string, sectionLabel: string): { value: Record<string, unknown> } | { error: string } {
	let parsed: unknown;

	try {
		parsed = JSON.parse(json);
	} catch {
		return { error: `Unable to parse JWT ${sectionLabel}. The decoded ${sectionLabel} is not valid JSON.` };
	}

	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
		return { error: `Unable to parse JWT ${sectionLabel}. The decoded ${sectionLabel} is not a JSON object.` };
	}

	return { value: parsed as Record<string, unknown> };
}

export function decodeJwt(token: string): JwtDecodeResult {
	const trimmed = token.trim();

	if (!trimmed) {
		return { success: false, error: "Please enter a JWT." };
	}

	const parts = trimmed.split(".");

	if (parts.length !== 3) {
		return {
			success: false,
			error: "Invalid JWT structure. A JWT must contain three parts: Header.Payload.Signature",
		};
	}

	const [headerPart, payloadPart, signaturePart] = parts as [string, string, string];

	if (!headerPart || !payloadPart || !signaturePart) {
		return {
			success: false,
			error: "Invalid JWT structure. A JWT must contain three parts: Header.Payload.Signature",
		};
	}

	let headerJson: string;
	let payloadJson: string;

	try {
		headerJson = base64UrlDecode(headerPart);
		payloadJson = base64UrlDecode(payloadPart);
	} catch {
		return {
			success: false,
			error: "Unable to decode JWT. One of the JWT sections contains invalid Base64URL data.",
		};
	}

	const header = parseJsonObject(headerJson, "header");
	if ("error" in header) {
		return { success: false, error: header.error };
	}

	const payload = parseJsonObject(payloadJson, "payload");
	if ("error" in payload) {
		return { success: false, error: payload.error };
	}

	return {
		success: true,
		data: {
			header: header.value as JwtHeader,
			payload: payload.value as JwtPayload,
			signature: signaturePart,
			raw: {
				header: headerPart,
				payload: payloadPart,
				signature: signaturePart,
			},
		},
	};
}
