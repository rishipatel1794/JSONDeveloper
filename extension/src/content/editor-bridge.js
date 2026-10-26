// Runs ONLY on https://jsondeveloper.com/visualizer* (see manifest.json's matches for this script) —
// its sole job is handing off a pending transfer from chrome.storage.local into the page via
// postMessage, since a regular web page has no access to chrome.storage itself.
(function () {
	"use strict";

	const STORAGE_KEY = "pendingTransfer";
	const TRANSFER_TTL_MS = 60_000;
	const BRIDGE_MESSAGE_SOURCE = "jsondeveloper-extension";
	const REQUEST_TYPE = "REQUEST_PENDING_TRANSFER";
	const RESPONSE_TYPE = "LOAD_JSON";

	// This script can finish loading (document_idle) well before the page's own React effects —
	// and the message listener they set up — are mounted. Posting a pending transfer eagerly on
	// load would race that: if it posts before the page is listening, the message is lost for good,
	// and since reading storage also deletes the entry (single-use), there'd be no way to retry.
	// So delivery is entirely request-driven: the page asks (once its own listener exists — see
	// apps/web/components/tools/json-visualizer/JsonVisualizer.tsx), and only then do we read and
	// hand off the transfer. This listener itself is registered synchronously below, so it's active
	// before the page could possibly have anything to ask for.
	window.addEventListener("message", event => {
		// Same-origin is the binding security check here: anything that can post a same-origin
		// message with this exact shape already runs with full same-origin script access anyway, so
		// an additional window-identity check adds no real protection beyond origin — and unlike
		// origin, that identity can legitimately differ depending on how a message was dispatched.
		if (event.origin !== window.location.origin) return;

		const data = event.data;
		if (!data || typeof data !== "object") return;
		if (data.source !== BRIDGE_MESSAGE_SOURCE || data.type !== REQUEST_TYPE) return;

		chrome.storage.local.get(STORAGE_KEY, result => {
			const transfer = result[STORAGE_KEY];
			if (!transfer || typeof transfer.json !== "string") return;

			// Single-use: clear immediately so a second request (e.g. a page reload) never re-delivers
			// the same payload, regardless of whether this particular delivery below succeeds.
			chrome.storage.local.remove(STORAGE_KEY);

			const age = Date.now() - (transfer.createdAt ?? 0);
			if (age > TRANSFER_TTL_MS) return;

			window.postMessage(
				{
					source: BRIDGE_MESSAGE_SOURCE,
					type: RESPONSE_TYPE,
					payload: { json: transfer.json, sourceUrl: transfer.sourceUrl },
				},
				window.location.origin,
			);
		});
	});
})();
