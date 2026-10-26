// Shared across background, content scripts, and the popup — kept dependency-free (plain JS, no
// bundler) so every piece of the extension can load it directly via a <script> tag or ES import.

export const WEBSITE_ORIGIN = "https://jsondeveloper.com";
export const VISUALIZER_URL = `${WEBSITE_ORIGIN}/visualizer`;

export const STORAGE_KEYS = {
	PENDING_TRANSFER: "pendingTransfer",
	PREFERENCES: "preferences",
};

// The five JSON-viewer themes. `id` is also used as the CSS `[data-jd-theme]` selector value in
// json-viewer.css — keep ids in sync between the two files (json-viewer.js duplicates this list,
// see the comment at the top of that file).
export const THEMES = [
	{ id: "midnight-teal", label: "Midnight Teal" },
	{ id: "light-clean", label: "Light Clean" },
	{ id: "vscode-dark", label: "VS Code Dark" },
	{ id: "dracula", label: "Dracula" },
	{ id: "high-contrast", label: "High Contrast" },
];

export const FONT_SIZES = [
	{ id: "small", label: "Small", px: 12 },
	{ id: "medium", label: "Medium", px: 13 },
	{ id: "large", label: "Large", px: 15 },
];

// "Bundled" fonts aren't shipped as binary font files here (no reliable way to vendor/license-check
// webfont binaries in this environment) — both options are curated monospace *stacks* that prefer a
// popular coding font if the user happens to have it installed locally, falling back to a reliable
// system monospace. See extension/README.md's Typography section for the honest caveat.
export const FONT_FAMILIES = [
	{ id: "default-mono", label: "Default Monospace", stack: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace" },
	{ id: "system-mono", label: "System Monospace", stack: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace" },
];

export const DEFAULT_PREFERENCES = {
	autoFormat: true,
	theme: "midnight-teal",
	fontSize: "medium",
	fontFamily: "default-mono",
};

/**
 * Reads preferences via chrome.storage.sync, falling back to chrome.storage.local if sync is
 * unavailable or rejects (e.g. sync disabled/quota issues) — "safe fallback" per the spec.
 */
export async function loadPreferences() {
	try {
		const stored = await chrome.storage.sync.get(STORAGE_KEYS.PREFERENCES);
		return { ...DEFAULT_PREFERENCES, ...stored[STORAGE_KEYS.PREFERENCES] };
	} catch {
		const stored = await chrome.storage.local.get(STORAGE_KEYS.PREFERENCES);
		return { ...DEFAULT_PREFERENCES, ...stored[STORAGE_KEYS.PREFERENCES] };
	}
}

/** Merges `partial` into the stored preferences and writes back to sync, falling back to local. */
export async function savePreferences(partial) {
	const current = await loadPreferences();
	const next = { ...current, ...partial };
	try {
		await chrome.storage.sync.set({ [STORAGE_KEYS.PREFERENCES]: next });
	} catch {
		await chrome.storage.local.set({ [STORAGE_KEYS.PREFERENCES]: next });
	}
	return next;
}

// A transfer older than this is treated as stale and never applied — bounds how long a payload
// can sit in chrome.storage waiting for the destination tab to pick it up.
export const TRANSFER_TTL_MS = 60_000;

// Payloads larger than this are not transferred via chrome.storage — the user is told to copy/
// download manually instead, rather than silently truncating their data.
export const MAX_TRANSFER_BYTES = 2 * 1024 * 1024;

export const BRIDGE_MESSAGE_SOURCE = "jsondeveloper-extension";
