import { describe, expect, it } from "vitest";

import { analyzeCors } from "./cors";

describe("analyzeCors", () => {
	it("reports INFO when no CORS headers are present", () => {
		const findings = analyzeCors(new Headers());
		expect(findings[0]!.id).toBe("no-cors-headers");
		expect(findings[0]!.severity).toBe("INFO");
	});

	it("flags wildcard + credentials as HIGH", () => {
		const findings = analyzeCors(new Headers({ "access-control-allow-origin": "*", "access-control-allow-credentials": "true" }));
		expect(findings[0]!.id).toBe("cors-wildcard-with-credentials");
		expect(findings[0]!.severity).toBe("HIGH");
	});

	it("flags a bare wildcard as LOW, not HIGH", () => {
		const findings = analyzeCors(new Headers({ "access-control-allow-origin": "*" }));
		expect(findings[0]!.id).toBe("cors-wildcard");
		expect(findings[0]!.severity).toBe("LOW");
	});

	it("passes a specific allowed origin", () => {
		const findings = analyzeCors(new Headers({ "access-control-allow-origin": "https://trusted.example.com" }));
		expect(findings[0]!.id).toBe("cors-restricted");
		expect(findings[0]!.severity).toBe("PASS");
	});
});
