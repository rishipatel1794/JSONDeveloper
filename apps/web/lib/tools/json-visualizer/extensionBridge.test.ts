import { describe, expect, it } from "vitest";

import { BRIDGE_MESSAGE_SOURCE, REQUEST_TRANSFER_MESSAGE_TYPE, buildTransferRequestMessage, parseExtensionLoadJsonMessage } from "./extensionBridge";

const SELF = {};
const ORIGIN = "https://jsondeveloper.com";

function makeEvent(overrides: Partial<{ source: unknown; origin: string; data: unknown }> = {}): MessageEvent {
	return {
		source: SELF,
		origin: ORIGIN,
		data: { source: BRIDGE_MESSAGE_SOURCE, type: "LOAD_JSON", payload: { json: "{}" } },
		...overrides,
	} as MessageEvent;
}

describe("parseExtensionLoadJsonMessage", () => {
	it("accepts a well-formed message from the expected window and origin", () => {
		const result = parseExtensionLoadJsonMessage(makeEvent(), SELF, ORIGIN);
		expect(result).toEqual({ json: "{}", sourceUrl: undefined });
	});

	it("passes through an optional sourceUrl", () => {
		const event = makeEvent({ data: { source: BRIDGE_MESSAGE_SOURCE, type: "LOAD_JSON", payload: { json: "{}", sourceUrl: "https://api.example.com/data" } } });
		const result = parseExtensionLoadJsonMessage(event, SELF, ORIGIN);
		expect(result?.sourceUrl).toBe("https://api.example.com/data");
	});

	it("rejects a message from a different window", () => {
		const result = parseExtensionLoadJsonMessage(makeEvent(), {}, ORIGIN);
		expect(result).toBeNull();
	});

	it("rejects a message from a different origin", () => {
		const result = parseExtensionLoadJsonMessage(makeEvent({ origin: "https://evil.example.com" }), SELF, ORIGIN);
		expect(result).toBeNull();
	});

	it("rejects a message with the wrong source tag", () => {
		const event = makeEvent({ data: { source: "some-other-extension", type: "LOAD_JSON", payload: { json: "{}" } } });
		expect(parseExtensionLoadJsonMessage(event, SELF, ORIGIN)).toBeNull();
	});

	it("rejects a message with the wrong type", () => {
		const event = makeEvent({ data: { source: BRIDGE_MESSAGE_SOURCE, type: "SOMETHING_ELSE", payload: { json: "{}" } } });
		expect(parseExtensionLoadJsonMessage(event, SELF, ORIGIN)).toBeNull();
	});

	it("rejects a message with a non-string json payload", () => {
		const event = makeEvent({ data: { source: BRIDGE_MESSAGE_SOURCE, type: "LOAD_JSON", payload: { json: 42 } } });
		expect(parseExtensionLoadJsonMessage(event, SELF, ORIGIN)).toBeNull();
	});

	it("rejects malformed data shapes without throwing", () => {
		expect(parseExtensionLoadJsonMessage(makeEvent({ data: null }), SELF, ORIGIN)).toBeNull();
		expect(parseExtensionLoadJsonMessage(makeEvent({ data: "just a string" }), SELF, ORIGIN)).toBeNull();
		expect(parseExtensionLoadJsonMessage(makeEvent({ data: { source: BRIDGE_MESSAGE_SOURCE, type: "LOAD_JSON", payload: null } }), SELF, ORIGIN)).toBeNull();
	});
});

describe("buildTransferRequestMessage", () => {
	it("tags the message with the shared bridge source and the request type the extension listens for", () => {
		expect(buildTransferRequestMessage()).toEqual({ source: BRIDGE_MESSAGE_SOURCE, type: REQUEST_TRANSFER_MESSAGE_TYPE });
	});
});
