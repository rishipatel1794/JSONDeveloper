import { describe, expect, it } from "vitest";

import { buildTableData, formatCellValue } from "./tableData";

describe("buildTableData", () => {
	it("returns null for a non-array value", () => {
		expect(buildTableData({ a: 1 })).toBeNull();
		expect(buildTableData(42)).toBeNull();
	});

	it("returns null for an empty array", () => {
		expect(buildTableData([])).toBeNull();
	});

	it("detects the union of columns across objects with different fields", () => {
		const table = buildTableData([
			{ id: 1, name: "a" },
			{ id: 2, email: "b@example.com" },
		]);
		expect(table!.isObjectArray).toBe(true);
		expect(table!.columns).toEqual(["id", "name", "email"]);
	});

	it("leaves a missing field as undefined rather than throwing", () => {
		const table = buildTableData([{ id: 1, name: "a" }, { id: 2 }]);
		expect(table!.rows[1]!.cells.name).toBeUndefined();
	});

	it("falls back to a single value column for a non-object array", () => {
		const table = buildTableData([1, 2, 3]);
		expect(table!.isObjectArray).toBe(false);
		expect(table!.columns).toEqual(["value"]);
		expect(table!.rows).toHaveLength(3);
	});

	it("assigns a JSON path per row", () => {
		const table = buildTableData([{ a: 1 }, { a: 2 }], "data");
		expect(table!.rows.map(r => r.path)).toEqual(["data[0]", "data[1]"]);
	});
});

describe("formatCellValue", () => {
	it("renders undefined as an empty string", () => {
		expect(formatCellValue(undefined)).toBe("");
	});

	it("renders null explicitly", () => {
		expect(formatCellValue(null)).toBe("null");
	});

	it("renders nested arrays and objects as a compact count", () => {
		expect(formatCellValue([1, 2, 3])).toBe("[3]");
		expect(formatCellValue({ a: 1, b: 2 })).toBe("{2}");
	});

	it("renders primitives directly", () => {
		expect(formatCellValue(42)).toBe("42");
		expect(formatCellValue(true)).toBe("true");
		expect(formatCellValue("hi")).toBe("hi");
	});
});
