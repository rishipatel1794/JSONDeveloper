export interface OcrDocumentMeta {
	filename?: string;
	fileType?: string;
	pageCount?: number;
}

export interface OcrKeyValueRow {
	key: string;
	value: string;
}

export interface OcrToJsonData {
	document: OcrDocumentMeta;
	table: OcrKeyValueRow[];
	unlabeled: string[];
}

export interface OcrToJsonResult {
	success: boolean;
	data?: OcrToJsonData;
	error?: string;
}

function isBareLabel(block: string): boolean {
	return /:\s*$/.test(block);
}

/** Only a single-line block qualifies — a label and its value sharing one line, e.g. "Test gas: AIR". */
function matchInlineLabelValue(block: string): OcrKeyValueRow | null {
	if (block.includes("\n")) return null;

	const match = block.match(/^([^:]+):\s*(\S.*)$/);
	if (!match) return null;

	const [, key, value] = match;
	return { key: key!.trim(), value: value!.trim() };
}

function stripLabelColon(block: string): string {
	return block.replace(/:\s*$/, "").trim();
}

/**
 * Splits OCR'd form text (blank-line-separated blocks, in reading order) into label/value rows.
 *
 * Handles three shapes that show up in real OCR output: a bare "Label:" block followed by a separate
 * value block, "Label: Value" inline on one line, and a label with no value at all before the next
 * label starts (common when OCR finds nothing under a field). Anything that doesn't fit one of those —
 * document titles, and content fragments OCR attached to the wrong block due to reading-order quirks —
 * is preserved in `unlabeled` rather than silently dropped or guessed at.
 */
export function parseOcrTextToTable(markdown: string): { table: OcrKeyValueRow[]; unlabeled: string[] } {
	const blocks = markdown
		.split(/\n\s*\n/)
		.map(block => block.trim())
		.filter(block => block.length > 0);

	const table: OcrKeyValueRow[] = [];
	const unlabeled: string[] = [];
	let pendingKey: string | null = null;

	function flushPendingAsEmpty() {
		if (pendingKey !== null) {
			table.push({ key: pendingKey, value: "" });
			pendingKey = null;
		}
	}

	for (const block of blocks) {
		const inline = matchInlineLabelValue(block);
		if (inline) {
			flushPendingAsEmpty();
			table.push(inline);
			continue;
		}

		if (isBareLabel(block)) {
			flushPendingAsEmpty();
			pendingKey = stripLabelColon(block);
			continue;
		}

		const lines = block
			.split("\n")
			.map(line => line.trim())
			.filter(Boolean);

		if (pendingKey !== null) {
			const [value, ...rest] = lines;
			table.push({ key: pendingKey, value: value ?? "" });
			// A loop rather than `unlabeled.push(...rest)` — spreading a large array as call arguments
			// hits V8's argument-count limit ("Maximum call stack size exceeded") well before any real
			// recursion depth, and multi-page OCR responses routinely produce line arrays that large.
			for (const line of rest) unlabeled.push(line);
			pendingKey = null;
		} else {
			for (const line of lines) unlabeled.push(line);
		}
	}

	flushPendingAsEmpty();

	return { table, unlabeled };
}

function readDocumentMeta(record: Record<string, unknown>): OcrDocumentMeta {
	return {
		filename: typeof record.filename === "string" ? record.filename : undefined,
		fileType: typeof record.file_type === "string" ? record.file_type : undefined,
		pageCount: typeof record.page_count === "number" ? record.page_count : undefined,
	};
}

/** Supports the plain `{ markdown: "..." }` shape and PaddleOCR-VL/PP-StructureV3's nested `{ markdown: { markdown_texts: "..." } }`. */
function extractMarkdownText(parsed: unknown): { markdown: string; document: OcrDocumentMeta } | null {
	if (typeof parsed === "string") {
		return { markdown: parsed, document: {} };
	}

	if (!parsed || typeof parsed !== "object") return null;

	const record = parsed as Record<string, unknown>;
	const document = readDocumentMeta(record);

	if (typeof record.markdown === "string") {
		return { markdown: record.markdown, document };
	}

	if (typeof record.markdown_texts === "string") {
		return { markdown: record.markdown_texts, document };
	}

	if (record.markdown && typeof record.markdown === "object") {
		const nested = record.markdown as Record<string, unknown>;
		if (typeof nested.markdown_texts === "string") {
			return { markdown: nested.markdown_texts, document };
		}
	}

	return null;
}

/**
 * Converts a document-parsing OCR response (PaddleOCR and similar tools that output OCR'd text as
 * "markdown" — reading-order text blocks, not real Markdown syntax) into structured JSON. Accepts the
 * full `{ filename, file_type, page_count, markdown }` response shape, or just the raw OCR'd text
 * pasted on its own with no wrapping JSON.
 */
export function convertOcrResponseToJson(input: string): OcrToJsonResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { success: false, error: "Paste an OCR response to convert." };
	}

	let markdownText: string;
	let document: OcrDocumentMeta = {};

	try {
		const parsed = JSON.parse(trimmed);
		const extracted = extractMarkdownText(parsed);

		if (!extracted) {
			return { success: false, error: 'Valid JSON, but no "markdown" (or "markdown_texts") text field was found.' };
		}

		markdownText = extracted.markdown;
		document = extracted.document;
	} catch {
		// Not JSON — treat the whole input as the raw OCR'd text itself.
		markdownText = trimmed;
	}

	const { table, unlabeled } = parseOcrTextToTable(markdownText);

	return {
		success: true,
		data: { document, table, unlabeled },
	};
}
