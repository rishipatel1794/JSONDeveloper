import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

import { JSDOM } from "jsdom";

const currentDir = dirname(fileURLToPath(import.meta.url));
const scriptSource = readFileSync(join(currentDir, "../src/content/editor-bridge.js"), "utf8");

const REQUEST_MESSAGE = { source: "jsondeveloper-extension", type: "REQUEST_PENDING_TRANSFER" };

/** Loads the bridge script, then simulates the page asking for a pending transfer (as JsonVisualizer.tsx does on mount). */
async function runBridge({ storedValue, removedKeys, requestOverrides = {} }) {
	const dom = new JSDOM("<!doctype html>", { url: "https://jsondeveloper.com/visualizer" });
	const { window } = dom;

	const postedMessages = [];
	window.postMessage = (data, targetOrigin) => postedMessages.push({ data, targetOrigin });

	window.chrome = {
		storage: {
			local: {
				get: (key, callback) => callback({ pendingTransfer: storedValue }),
				remove: key => removedKeys.push(key),
			},
		},
	};

	const context = vm.createContext(window);
	vm.runInContext(scriptSource, context);

	// Dispatch the same request shape the website posts once its own message listener is mounted.
	const event = new window.MessageEvent("message", {
		data: REQUEST_MESSAGE,
		origin: "https://jsondeveloper.com",
		source: window,
		...requestOverrides,
	});
	window.dispatchEvent(event);
	await new Promise(resolve => setTimeout(resolve, 0));

	return { window, postedMessages };
}

describe("editor-bridge content script", () => {
	it("does nothing until the page requests a pending transfer", async () => {
		const dom = new JSDOM("<!doctype html>", { url: "https://jsondeveloper.com/visualizer" });
		const { window } = dom;
		const postedMessages = [];
		window.postMessage = (data, targetOrigin) => postedMessages.push({ data, targetOrigin });
		let storageRead = false;
		window.chrome = {
			storage: {
				local: {
					get: (key, callback) => {
						storageRead = true;
						callback({ pendingTransfer: { json: "{}", createdAt: Date.now() } });
					},
					remove: () => {},
				},
			},
		};

		vm.runInContext(scriptSource, vm.createContext(window));
		await new Promise(resolve => setTimeout(resolve, 0));

		assert.equal(storageRead, false, "storage must not be read before the page asks for a transfer");
		assert.equal(postedMessages.length, 0);
	});

	it("does nothing when there is no pending transfer", async () => {
		const { postedMessages } = await runBridge({ storedValue: undefined, removedKeys: [] });
		assert.equal(postedMessages.length, 0);
	});

	it("responds to a request by posting a fresh transfer into the page and clearing it from storage", async () => {
		const removedKeys = [];
		const { postedMessages } = await runBridge({
			storedValue: { json: '{"a":1}', sourceUrl: "https://api.example.com/x", createdAt: Date.now() },
			removedKeys,
		});

		assert.equal(postedMessages.length, 1);
		assert.equal(postedMessages[0].data.type, "LOAD_JSON");
		assert.equal(postedMessages[0].data.source, "jsondeveloper-extension");
		assert.equal(postedMessages[0].data.payload.json, '{"a":1}');
		assert.equal(postedMessages[0].targetOrigin, "https://jsondeveloper.com");
		assert.deepEqual(removedKeys, ["pendingTransfer"]);
	});

	it("discards a stale transfer older than the TTL without posting it, but still clears it", async () => {
		const removedKeys = [];
		const { postedMessages } = await runBridge({
			storedValue: { json: '{"a":1}', createdAt: Date.now() - 120_000 },
			removedKeys,
		});

		assert.equal(postedMessages.length, 0);
		assert.deepEqual(removedKeys, ["pendingTransfer"]);
	});

	it("ignores a malformed stored value without throwing", async () => {
		await assert.doesNotReject(runBridge({ storedValue: { notJson: true }, removedKeys: [] }));
		await assert.doesNotReject(runBridge({ storedValue: "a string, not an object", removedKeys: [] }));
	});

	it("ignores a request from a different origin", async () => {
		const { postedMessages } = await runBridge({
			storedValue: { json: '{"a":1}', createdAt: Date.now() },
			removedKeys: [],
			requestOverrides: { origin: "https://evil.example.com" },
		});
		assert.equal(postedMessages.length, 0);
	});

	it("ignores a message that isn't the expected request shape", async () => {
		const { postedMessages } = await runBridge({
			storedValue: { json: '{"a":1}', createdAt: Date.now() },
			removedKeys: [],
			requestOverrides: { data: { source: "jsondeveloper-extension", type: "SOMETHING_ELSE" } },
		});
		assert.equal(postedMessages.length, 0);
	});

	it("answers a second request with nothing once the transfer has already been delivered (single-use)", async () => {
		const dom = new JSDOM("<!doctype html>", { url: "https://jsondeveloper.com/visualizer" });
		const { window } = dom;
		const postedMessages = [];
		window.postMessage = (data, targetOrigin) => postedMessages.push({ data, targetOrigin });

		let stored = { pendingTransfer: { json: '{"a":1}', createdAt: Date.now() } };
		window.chrome = {
			storage: {
				local: {
					get: (key, callback) => callback({ ...stored }),
					remove: () => {
						stored = {};
					},
				},
			},
		};

		vm.runInContext(scriptSource, vm.createContext(window));

		const send = () =>
			window.dispatchEvent(new window.MessageEvent("message", { data: REQUEST_MESSAGE, origin: "https://jsondeveloper.com", source: window }));

		send();
		await new Promise(resolve => setTimeout(resolve, 0));
		send();
		await new Promise(resolve => setTimeout(resolve, 0));

		assert.equal(postedMessages.length, 1);
	});
});
