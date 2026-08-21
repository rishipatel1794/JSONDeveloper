import type { ApiBodyType } from "./types";

/**
 * A one-shot, same-tab handoff for "open this in the API Client" actions from other tools (e.g. the
 * JSON Validator's "Send to API Client"). Deliberately NOT a new state architecture — it's read once
 * on mount by the existing `startNewRequest`/`setDraft` flow and immediately cleared.
 */
const STORAGE_KEY = "devtools:api-client:pending-request";

export interface PendingApiRequest {
	method?: string;
	url?: string;
	body: string;
	bodyType: ApiBodyType;
}

export function setPendingApiRequest(request: PendingApiRequest): void {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(request));
	} catch {
		// Storage unavailable — the receiving tab just won't find anything to prefill.
	}
}

function isPendingApiRequest(value: unknown): value is PendingApiRequest {
	if (typeof value !== "object" || value === null) return false;
	const record = value as Record<string, unknown>;
	return typeof record.body === "string" && typeof record.bodyType === "string";
}

/** Reads and immediately clears the pending request — it's meant to be consumed exactly once. */
export function consumePendingApiRequest(): PendingApiRequest | null {
	if (typeof window === "undefined") return null;

	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		window.sessionStorage.removeItem(STORAGE_KEY);

		const parsed: unknown = JSON.parse(raw);
		return isPendingApiRequest(parsed) ? parsed : null;
	} catch {
		return null;
	}
}
