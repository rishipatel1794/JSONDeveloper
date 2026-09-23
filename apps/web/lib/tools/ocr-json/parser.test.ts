import { describe, expect, it } from "vitest";

import { convertOcrResponseToJson, parseOcrTextToTable } from "./parser";

// The exact response shape a real OCR/document-parsing pipeline (PaddleOCR-style) produced for a
// 36-page pharma filter-integrity test report — used verbatim as a regression fixture.
const REAL_SAMPLE = {
	filename: "1012426034-F-Pre-Post Integrity for gassing filters.pdf",
	file_type: "pdf",
	page_count: 36,
	markdown:
		"Pall Flowstar V Test Result Report\n\nDate / Time:\n\n29/Jun/2026 15:32:03\n1 of 3\n\nPage:\n\nSoftware version:\n\n4.2.0\n\nSerial/Result number:\n\n07310350.432\n\nFunction:\n\nBubble Point\n\nOperator:\n\nD. Akshay\n\nTest program:\n\nG50CF0202H2H-60%IPA\n\nProduction area:\n\nSUITE-02\n\nFilter line:\n\nBuffer tank\n\nProduct name:\n\n8.4% SODIUM BICARBONATE INJ\n\nProduct batch:\n\n1012426034\n\nFilter part number:\n\nNumber of filters:\n\nFilter serial number(s):\n\nD26011045/5420\n\nFilter housing:\n\nDisk filter\n\nWetting liquid: 60%IPA\n\nTest gas: AIR\n\nModule factor:\n\n0.200\n\nStart pressure:\n\n700 mbar\n",
};

describe("convertOcrResponseToJson", () => {
	it("converts the real pharma test-report sample into the expected table + unlabeled shape", () => {
		const result = convertOcrResponseToJson(JSON.stringify(REAL_SAMPLE));

		expect(result.success).toBe(true);
		expect(result.data?.document).toEqual({
			filename: "1012426034-F-Pre-Post Integrity for gassing filters.pdf",
			fileType: "pdf",
			pageCount: 36,
		});

		expect(result.data?.table).toEqual([
			{ key: "Date / Time", value: "29/Jun/2026 15:32:03" },
			{ key: "Page", value: "" },
			{ key: "Software version", value: "4.2.0" },
			{ key: "Serial/Result number", value: "07310350.432" },
			{ key: "Function", value: "Bubble Point" },
			{ key: "Operator", value: "D. Akshay" },
			{ key: "Test program", value: "G50CF0202H2H-60%IPA" },
			{ key: "Production area", value: "SUITE-02" },
			{ key: "Filter line", value: "Buffer tank" },
			{ key: "Product name", value: "8.4% SODIUM BICARBONATE INJ" },
			{ key: "Product batch", value: "1012426034" },
			{ key: "Filter part number", value: "" },
			{ key: "Number of filters", value: "" },
			{ key: "Filter serial number(s)", value: "D26011045/5420" },
			{ key: "Filter housing", value: "Disk filter" },
			{ key: "Wetting liquid", value: "60%IPA" },
			{ key: "Test gas", value: "AIR" },
			{ key: "Module factor", value: "0.200" },
			{ key: "Start pressure", value: "700 mbar" },
		]);

		expect(result.data?.unlabeled).toEqual(["Pall Flowstar V Test Result Report", "1 of 3"]);
	});

	it("accepts raw OCR'd text with no wrapping JSON", () => {
		const result = convertOcrResponseToJson("Operator:\n\nJane Doe");

		expect(result.success).toBe(true);
		expect(result.data?.document).toEqual({});
		expect(result.data?.table).toEqual([{ key: "Operator", value: "Jane Doe" }]);
	});

	it("supports the PaddleOCR-VL nested markdown_texts shape", () => {
		const response = JSON.stringify({
			filename: "doc.pdf",
			markdown: { markdown_texts: "Operator:\n\nJane Doe", markdown_images: {} },
		});

		const result = convertOcrResponseToJson(response);

		expect(result.success).toBe(true);
		expect(result.data?.table).toEqual([{ key: "Operator", value: "Jane Doe" }]);
	});

	it("returns an error for empty input", () => {
		const result = convertOcrResponseToJson("   ");
		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it("returns an error when valid JSON has no markdown field", () => {
		const result = convertOcrResponseToJson(JSON.stringify({ filename: "doc.pdf" }));
		expect(result.success).toBe(false);
		expect(result.error).toMatch(/markdown/i);
	});

	it("gives a trailing label with no following block an empty value", () => {
		const { table } = parseOcrTextToTable("Operator:\n\nJane Doe\n\nSignature:");
		expect(table).toEqual([
			{ key: "Operator", value: "Jane Doe" },
			{ key: "Signature", value: "" },
		]);
	});
});
