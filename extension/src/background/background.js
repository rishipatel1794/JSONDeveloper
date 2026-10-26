import { MAX_TRANSFER_BYTES, STORAGE_KEYS, VISUALIZER_URL } from "../shared/constants.js";

const VALID_MESSAGE_TYPES = new Set(["JSON_PAGE_DETECTED", "JSON_PAGE_CLEARED", "OPEN_IN_EDITOR"]);

/** Every message is validated by shape and type before anything happens — a malformed or unexpected message is just ignored. */
function isValidMessage(message) {
	return message && typeof message === "object" && typeof message.type === "string" && VALID_MESSAGE_TYPES.has(message.type);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!isValidMessage(message)) return undefined;

	if (message.type === "JSON_PAGE_DETECTED" && sender.tab?.id !== undefined) {
		chrome.action.setBadgeText({ tabId: sender.tab.id, text: "{ }" });
		chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: "#2dd4bf" });
		return undefined;
	}

	if (message.type === "JSON_PAGE_CLEARED" && sender.tab?.id !== undefined) {
		chrome.action.setBadgeText({ tabId: sender.tab.id, text: "" });
		return undefined;
	}

	if (message.type === "OPEN_IN_EDITOR") {
		void handleOpenInEditor(message, sendResponse);
		return true; // keep the message channel open for the async response
	}

	return undefined;
});

async function handleOpenInEditor(message, sendResponse) {
	const json = typeof message.json === "string" ? message.json : "";
	const sourceUrl = typeof message.sourceUrl === "string" ? message.sourceUrl : undefined;

	const byteLength = new TextEncoder().encode(json).byteLength;
	if (byteLength > MAX_TRANSFER_BYTES) {
		sendResponse({ success: false, error: `This JSON is ${Math.round(byteLength / 1024)}KB — larger than the ${MAX_TRANSFER_BYTES / 1024}KB transfer limit. Copy it manually instead.` });
		return;
	}

	await chrome.storage.local.set({
		[STORAGE_KEYS.PENDING_TRANSFER]: { json, sourceUrl, createdAt: Date.now() },
	});

	await chrome.tabs.create({ url: `${VISUALIZER_URL}?from=extension` });
	sendResponse({ success: true });
}
