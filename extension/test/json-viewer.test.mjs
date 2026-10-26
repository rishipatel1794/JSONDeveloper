import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

import { JSDOM } from "jsdom";

const currentDir = dirname(fileURLToPath(import.meta.url));
const scriptSource = readFileSync(join(currentDir, "../src/content/json-viewer.js"), "utf8");

/** Loads the content script fresh against a simulated "navigated directly to a JSON URL" document. */
async function runScriptAgainst({ rawText, contentType = "application/json", storedPreferences }) {
	const dom = new JSDOM(`<pre>${rawText}</pre>`, { url: "https://api.example.com/data" });
	const { window } = dom;

	Object.defineProperty(window.document, "contentType", { value: contentType, configurable: true });
	window.document.body.innerText = rawText; // jsdom doesn't fully implement layout-based innerText

	const sentMessages = [];
	const syncStore = { preferences: storedPreferences };
	const syncSetCalls = [];
	window.chrome = {
		runtime: {
			sendMessage: (message, callback) => {
				sentMessages.push(message);
				if (callback) callback({ success: true });
			},
		},
		storage: {
			sync: {
				get: async () => ({ ...syncStore }),
				set: async update => {
					syncSetCalls.push(update);
					Object.assign(syncStore, update);
				},
			},
		},
	};

	const context = vm.createContext(window);
	vm.runInContext(scriptSource, context);

	// The script's top-level IIFE is `async` (it awaits a chrome.storage.sync.get call) — flush the
	// microtask/macrotask queue so its DOM mutations have actually happened before we assert on them.
	await new Promise(resolve => setTimeout(resolve, 0));

	return { window, document: window.document, sentMessages, syncSetCalls };
}

function getBtn(document, label) {
	return [...document.querySelectorAll(".jd-btn")].find(btn => btn.textContent === label);
}

describe("json-viewer content script", () => {
	it("does nothing when the content type is not application/json", async () => {
		const { document, sentMessages } = await runScriptAgainst({ rawText: "irrelevant", contentType: "text/html" });
		assert.equal(document.getElementById("jd-json-viewer-root"), null);
		assert.equal(sentMessages.length, 0);
	});

	it("does nothing when the body does not actually parse as JSON", async () => {
		const { document, sentMessages } = await runScriptAgainst({ rawText: "{not valid json" });
		assert.equal(document.getElementById("jd-json-viewer-root"), null);
		assert.equal(sentMessages.length, 0);
	});

	it("replaces the page with a viewer for valid JSON and reports detection", async () => {
		const { document, sentMessages } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1, b: "two" }) });
		assert.ok(document.getElementById("jd-json-viewer-root"));
		// A plain .type check, not deepEqual on the whole object — the message literal was created
		// inside jsdom's separate VM realm, so it has a different Object.prototype than this file's,
		// which deepStrictEqual treats as a mismatch even though the value is identical.
		assert.equal(sentMessages[0].type, "JSON_PAGE_DETECTED");
	});

	it("never injects a value as HTML — a script-like string stays inert text", async () => {
		const malicious = '<img src=x onerror="window.__pwned = true">';
		const { document, window } = await runScriptAgainst({ rawText: JSON.stringify({ payload: malicious }) });

		const html = document.getElementById("jd-json-viewer-root").innerHTML;
		assert.ok(html.includes("&lt;img") || !html.includes("<img"), "the raw value must not appear as a live element");
		assert.equal(window.__pwned, undefined);
		assert.equal(document.querySelector("img"), null);
	});

	it("renders both a Tree and a Raw toggle button", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }) });
		const labels = [...document.querySelectorAll(".jd-btn")].map(btn => btn.textContent);
		assert.ok(labels.includes("Tree"));
		assert.ok(labels.includes("Raw"));
		assert.ok(labels.includes("Open in JSONDeveloper"));
	});

	it("the raw view contains the exact formatted JSON text", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }) });
		const rawPre = document.querySelector(".jd-raw");
		assert.equal(rawPre.textContent, JSON.stringify({ a: 1 }, null, 2));
	});

	it("clicking 'Open in JSONDeveloper' sends the raw text and the page URL", async () => {
		const { document, window, sentMessages } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }) });
		const openBtn = [...document.querySelectorAll(".jd-btn")].find(btn => btn.textContent === "Open in JSONDeveloper");
		openBtn.dispatchEvent(new window.Event("click", { bubbles: true }));

		const openMessage = sentMessages.find(m => m.type === "OPEN_IN_EDITOR");
		assert.ok(openMessage);
		assert.equal(openMessage.json, JSON.stringify({ a: 1 }));
		assert.equal(openMessage.sourceUrl, "https://api.example.com/data");
	});

	it("does not throw on an empty object or array", async () => {
		await assert.doesNotReject(runScriptAgainst({ rawText: "{}" }));
		await assert.doesNotReject(runScriptAgainst({ rawText: "[]" }));
	});

	it("shows an empty-state message instead of a blank tree for an empty object or array", async () => {
		const { document: docObj } = await runScriptAgainst({ rawText: "{}" });
		assert.match(docObj.querySelector(".jd-empty-state").textContent, /empty object/i);

		const { document: docArr } = await runScriptAgainst({ rawText: "[]" });
		assert.match(docArr.querySelector(".jd-empty-state").textContent, /empty array/i);
	});

	it("defaults to the Midnight Teal theme when no preference is stored", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }) });
		assert.equal(document.getElementById("jd-json-viewer-root").dataset.jdTheme, "midnight-teal");
	});

	it("applies a previously stored theme", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }), storedPreferences: { theme: "dracula" } });
		assert.equal(document.getElementById("jd-json-viewer-root").dataset.jdTheme, "dracula");
	});

	it("ignores an unrecognized stored theme and falls back to Midnight Teal", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }), storedPreferences: { theme: "not-a-real-theme" } });
		assert.equal(document.getElementById("jd-json-viewer-root").dataset.jdTheme, "midnight-teal");
	});

	it("changing the theme in the settings panel updates the DOM and persists to storage", async () => {
		const { document, syncSetCalls } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }) });
		const themeSelect = [...document.querySelectorAll(".jd-settings-row select")][0];
		themeSelect.value = "vscode-dark";
		themeSelect.dispatchEvent(new document.defaultView.Event("change", { bubbles: true }));
		await new Promise(resolve => setTimeout(resolve, 0));

		assert.equal(document.getElementById("jd-json-viewer-root").dataset.jdTheme, "vscode-dark");
		assert.ok(syncSetCalls.some(call => call.preferences?.theme === "vscode-dark"));
	});

	it("changing the font size updates the --jd-font-size custom property", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }) });
		const root = document.getElementById("jd-json-viewer-root");
		const fontSizeSelect = [...document.querySelectorAll(".jd-settings-row select")][1];
		fontSizeSelect.value = "large";
		fontSizeSelect.dispatchEvent(new document.defaultView.Event("change", { bubbles: true }));
		await new Promise(resolve => setTimeout(resolve, 0));

		assert.equal(root.style.getPropertyValue("--jd-font-size"), "15px");
	});

	it("Expand All and Collapse All toggle every collapsible node", async () => {
		// Root + "outer" + "inner" are all collapsible (object/array with at least one entry); "leaf" is a
		// plain number leaf with no children — three collapsible nodes total for this document.
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ outer: { inner: { leaf: 1 } } }) });
		const expandAllBtn = getBtn(document, "Expand All");
		const collapseAllBtn = getBtn(document, "Collapse All");

		collapseAllBtn.dispatchEvent(new document.defaultView.Event("click", { bubbles: true }));
		assert.equal(document.querySelectorAll(".jd-children.jd-collapsed").length, 3);

		expandAllBtn.dispatchEvent(new document.defaultView.Event("click", { bubbles: true }));
		assert.equal(document.querySelectorAll(".jd-children.jd-collapsed").length, 0);
	});

	it("clicking a row gives it a single, visible selected state", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1, b: 2 }) });
		const rows = [...document.querySelectorAll(".jd-row")];
		rows[0].dispatchEvent(new document.defaultView.Event("click", { bubbles: true }));
		rows[1].dispatchEvent(new document.defaultView.Event("click", { bubbles: true }));

		const selected = document.querySelectorAll(".jd-row.jd-selected");
		assert.equal(selected.length, 1);
		assert.ok(rows[1].classList.contains("jd-selected"));
	});

	it("tree rows are keyboard-focusable (tabIndex 0) for accessibility", async () => {
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }) });
		const row = document.querySelector(".jd-row");
		assert.equal(row.tabIndex, 0);
	});

	it("long strings render truncated with a show more/less toggle that never truncates the real data on copy", async () => {
		const longValue = "x".repeat(200);
		const { document } = await runScriptAgainst({ rawText: JSON.stringify({ a: longValue }) });
		const toggleBtn = document.querySelector(".jd-string-toggle");
		assert.ok(toggleBtn, "a show more toggle should render for a long string value");
		assert.equal(toggleBtn.textContent, "show more");

		toggleBtn.dispatchEvent(new document.defaultView.Event("click", { bubbles: true }));
		assert.equal(toggleBtn.textContent, "show less");
		const valueSpan = document.querySelector(".jd-value.jd-string");
		assert.equal(valueSpan.textContent, JSON.stringify(longValue));

		// The raw view and the "Open in JSONDeveloper" payload must always carry the full, untruncated value.
		const rawPre = document.querySelector(".jd-raw");
		assert.ok(rawPre.textContent.includes(longValue));
	});

	it("respects an explicit autoFormat: false preference and leaves the default page untouched", async () => {
		const { document, sentMessages } = await runScriptAgainst({ rawText: JSON.stringify({ a: 1 }), storedPreferences: { autoFormat: false } });
		assert.equal(document.getElementById("jd-json-viewer-root"), null);
		assert.equal(sentMessages.length, 0);
	});
});
