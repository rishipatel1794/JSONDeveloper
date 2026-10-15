import { describe, expect, it, vi } from "vitest";

import worker from "./index.js";

function env(assetsResponse = new Response("ok", { status: 200 })) {
	return { ASSETS: { fetch: vi.fn().mockResolvedValue(assetsResponse) } };
}

describe("worker fetch", () => {
	it("redirects plain HTTP on the canonical domain to HTTPS, preserving path and query", async () => {
		const response = await worker.fetch(new Request("http://jsondeveloper.com/json-formatter?a=1"), env());
		expect(response.status).toBe(301);
		expect(response.headers.get("location")).toBe("https://jsondeveloper.com/json-formatter?a=1");
	});

	it("redirects www to the apex domain over HTTPS", async () => {
		const response = await worker.fetch(new Request("https://www.jsondeveloper.com/about"), env());
		expect(response.status).toBe(301);
		expect(response.headers.get("location")).toBe("https://jsondeveloper.com/about");
	});

	it("redirects the legacy workers.dev hostname to the apex domain", async () => {
		const response = await worker.fetch(new Request("https://jsondeveloper.rishipatel1794.workers.dev/"), env());
		expect(response.status).toBe(301);
		expect(response.headers.get("location")).toBe("https://jsondeveloper.com/");
	});

	it("applies security headers to a redirect response", async () => {
		const response = await worker.fetch(new Request("http://jsondeveloper.com/"), env());
		expect(response.headers.get("strict-transport-security")).toContain("max-age=63072000");
		expect(response.headers.get("x-content-type-options")).toBe("nosniff");
	});

	it("falls through to the assets binding for a normal HTTPS request on the canonical domain", async () => {
		const assetsEnv = env(new Response("<html></html>", { status: 200 }));
		const response = await worker.fetch(new Request("https://jsondeveloper.com/json-formatter"), assetsEnv);
		expect(assetsEnv.ASSETS.fetch).toHaveBeenCalledOnce();
		expect(response.status).toBe(200);
		expect(response.headers.get("strict-transport-security")).toContain("max-age=63072000");
	});
});
