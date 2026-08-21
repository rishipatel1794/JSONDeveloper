import { describe, expect, it } from "vitest";

import { computeMaxDepth } from "./analyzer";

describe("computeMaxDepth", () => {
	it("treats a flat object as depth 1", () => {
		expect(computeMaxDepth({ name: "Rishi", age: 25, active: true })).toBe(1);
	});

	it("treats an empty object/array as depth 1", () => {
		expect(computeMaxDepth({})).toBe(1);
		expect(computeMaxDepth([])).toBe(1);
	});

	it("treats a bare primitive root as depth 0", () => {
		expect(computeMaxDepth("hello")).toBe(0);
		expect(computeMaxDepth(42)).toBe(0);
		expect(computeMaxDepth(null)).toBe(0);
	});

	it("computes a 4-level nested object correctly", () => {
		const value = { user: { profile: { address: { city: "Ahmedabad" } } } };
		expect(computeMaxDepth(value)).toBe(4);
	});

	it("takes the deepest branch when siblings differ in depth", () => {
		const value = { a: { b: 1 }, c: { d: { e: { f: 1 } } } };
		expect(computeMaxDepth(value)).toBe(4);
	});
});
