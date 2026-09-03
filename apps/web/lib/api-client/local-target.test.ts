import { describe, expect, it } from "vitest";

import { isLocalOrPrivateTarget } from "./local-target";

describe("isLocalOrPrivateTarget", () => {
	it("detects localhost and loopback addresses", () => {
		expect(isLocalOrPrivateTarget("http://localhost:3000/api")).toBe(true);
		expect(isLocalOrPrivateTarget("http://127.0.0.1:5000")).toBe(true);
		expect(isLocalOrPrivateTarget("http://[::1]:8080")).toBe(true);
	});

	it("detects RFC 1918 private ranges and link-local addresses", () => {
		expect(isLocalOrPrivateTarget("http://10.0.0.5:3000")).toBe(true);
		expect(isLocalOrPrivateTarget("http://172.16.0.1")).toBe(true);
		expect(isLocalOrPrivateTarget("http://172.31.255.255")).toBe(true);
		expect(isLocalOrPrivateTarget("http://192.168.1.10:8080")).toBe(true);
		expect(isLocalOrPrivateTarget("http://169.254.1.1")).toBe(true);
	});

	it("does not flag a public IP that merely resembles a private range", () => {
		expect(isLocalOrPrivateTarget("http://172.32.0.1")).toBe(false);
		expect(isLocalOrPrivateTarget("http://172.15.0.1")).toBe(false);
	});

	it("does not flag public hostnames or IPs", () => {
		expect(isLocalOrPrivateTarget("https://api.example.com/v1/users")).toBe(false);
		expect(isLocalOrPrivateTarget("https://8.8.8.8")).toBe(false);
	});

	it("returns false for an unparseable URL", () => {
		expect(isLocalOrPrivateTarget("not a url")).toBe(false);
	});
});
