export const BRIDGE_MESSAGE_SOURCE = "jsondeveloper-extension";

// Sent BY the website asking the extension's bridge content script (editor-bridge.js) for any
// pending transfer. The bridge script only reads/delivers chrome.storage in response to this —
// it never posts eagerly on page load — because the content script can finish loading well before
// this page's own React effects (and this message listener) are mounted; posting blind risks the
// message being dispatched before anyone is listening, which silently drops it for good (the
// storage entry would already be gone by the time anyone noticed). Requesting on readiness instead
// guarantees the listener below exists before the extension ever reads or deletes the transfer.
export const REQUEST_TRANSFER_MESSAGE_TYPE = "REQUEST_PENDING_TRANSFER";

export function buildTransferRequestMessage(): { source: string; type: string } {
	return { source: BRIDGE_MESSAGE_SOURCE, type: REQUEST_TRANSFER_MESSAGE_TYPE };
}

export interface ExtensionLoadJsonPayload {
	json: string;
	sourceUrl?: string;
}

/**
 * Validates an incoming `window.postMessage` as a genuine hand-off from the JSONDeveloper Chrome
 * extension's content script (see extension/src/content/editor-bridge.js) — same-window origin, the
 * extension's own message source tag, and the expected shape — before trusting its payload at all.
 */
export function parseExtensionLoadJsonMessage(event: MessageEvent, expectedSource: unknown, expectedOrigin: string): ExtensionLoadJsonPayload | null {
	if (event.source !== expectedSource) return null;
	if (event.origin !== expectedOrigin) return null;

	const data = event.data as unknown;
	if (typeof data !== "object" || data === null) return null;

	const { source, type, payload } = data as Record<string, unknown>;
	if (source !== BRIDGE_MESSAGE_SOURCE || type !== "LOAD_JSON") return null;
	if (typeof payload !== "object" || payload === null) return null;

	const { json, sourceUrl } = payload as Record<string, unknown>;
	if (typeof json !== "string") return null;

	return { json, sourceUrl: typeof sourceUrl === "string" ? sourceUrl : undefined };
}
