import { describe, expect, it } from "vitest";

import { jsonToCsv } from "./convert";

describe("jsonToCsv", () => {
	it("converts a simple array of objects", () => {
		const result = jsonToCsv(
			[
				{ id: 1, name: "Alice" },
				{ id: 2, name: "Bob" },
			],
			{ delimiter: "," },
		);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.columns).toEqual(["id", "name"]);
			expect(result.csv).toBe("id,name\r\n1,Alice\r\n2,Bob");
		}
	});

	it("rejects a non-array root", () => {
		const result = jsonToCsv({ a: 1 }, { delimiter: "," });
		expect(result.success).toBe(false);
	});

	it("rejects an empty array", () => {
		const result = jsonToCsv([], { delimiter: "," });
		expect(result.success).toBe(false);
	});

	it("rejects an array of non-objects", () => {
		const result = jsonToCsv([1, 2, 3], { delimiter: "," });
		expect(result.success).toBe(false);
	});

	it("flattens nested objects into dot-notation columns", () => {
		const result = jsonToCsv([{ id: 1, address: { city: "London", zip: "E1" } }], { delimiter: "," });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.columns).toEqual(["id", "address.city", "address.zip"]);
		}
	});

	it("keeps arrays as a single JSON-stringified cell rather than exploding rows", () => {
		const result = jsonToCsv([{ id: 1, tags: ["a", "b"] }], { delimiter: "," });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.csv).toContain('"[""a"",""b""]"');
		}
	});

	it("leaves a missing field blank rather than throwing", () => {
		const result = jsonToCsv([{ a: 1, b: 2 }, { a: 3 }], { delimiter: "," });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.csv).toBe("a,b\r\n1,2\r\n3,");
		}
	});

	it("quotes a value containing the delimiter", () => {
		const result = jsonToCsv([{ name: "Smith, John" }], { delimiter: "," });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.csv).toContain('"Smith, John"');
		}
	});

	it("escapes an embedded quote by doubling it", () => {
		const result = jsonToCsv([{ quote: 'She said "hi"' }], { delimiter: "," });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.csv).toContain('"She said ""hi"""');
		}
	});

	it("quotes a value containing a newline", () => {
		const result = jsonToCsv([{ note: "line1\nline2" }], { delimiter: "," });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.csv).toContain('"line1\nline2"');
		}
	});

	it("renders null and undefined fields as empty cells", () => {
		const result = jsonToCsv([{ a: null, b: 1 }], { delimiter: "," });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.csv).toBe("a,b\r\n,1");
		}
	});

	it("supports a custom delimiter", () => {
		const result = jsonToCsv([{ a: 1, b: 2 }], { delimiter: ";" });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.csv).toBe("a;b\r\n1;2");
		}
	});
});
