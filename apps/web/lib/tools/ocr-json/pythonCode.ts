/**
 * A Python port of parser.ts's exact algorithm — verified to produce identical output by running
 * it against the same real-world sample used in parser.test.ts. Kept as a plain string (not
 * generated from the live input) since the conversion logic itself never changes per document.
 */
export const OCR_TO_JSON_PYTHON_CODE = `"""Convert an OCR/document-parsing response (PaddleOCR and similar) into structured JSON.

Document-parsing OCR tools often return recognized text as a "markdown" field that isn't
actually Markdown syntax -- just OCR'd text blocks in reading order, separated by blank
lines. This converts that into a flat table of label/value rows, keeping anything that
can't be confidently paired (titles, and fragments OCR attached out of order) in a
separate "unlabeled" list instead of dropping or guessing at it.
"""

from __future__ import annotations

import json
import re
from typing import Any


def _is_bare_label(block: str) -> bool:
    return bool(re.search(r":\\s*$", block))


def _match_inline_label_value(block: str) -> dict[str, str] | None:
    """Only a single-line block qualifies -- a label and its value sharing one line, e.g. "Test gas: AIR"."""
    if "\\n" in block:
        return None

    match = re.match(r"^([^:]+):\\s*(\\S.*)$", block)
    if not match:
        return None

    return {"key": match.group(1).strip(), "value": match.group(2).strip()}


def _strip_label_colon(block: str) -> str:
    return re.sub(r":\\s*$", "", block).strip()


def parse_ocr_text_to_table(markdown: str) -> tuple[list[dict[str, str]], list[str]]:
    """Splits OCR'd form text (blank-line-separated blocks, in reading order) into label/value rows.

    Handles three shapes that show up in real OCR output: a bare "Label:" block followed by a
    separate value block, "Label: Value" inline on one line, and a label with no value at all
    before the next label starts (common when OCR finds nothing under a field).
    """
    blocks = [b.strip() for b in re.split(r"\\n\\s*\\n", markdown) if b.strip()]

    table: list[dict[str, str]] = []
    unlabeled: list[str] = []
    pending_key: str | None = None

    def flush_pending_as_empty() -> None:
        nonlocal pending_key
        if pending_key is not None:
            table.append({"key": pending_key, "value": ""})
            pending_key = None

    for block in blocks:
        inline = _match_inline_label_value(block)
        if inline:
            flush_pending_as_empty()
            table.append(inline)
            continue

        if _is_bare_label(block):
            flush_pending_as_empty()
            pending_key = _strip_label_colon(block)
            continue

        lines = [line.strip() for line in block.split("\\n") if line.strip()]

        if pending_key is not None:
            value = lines[0] if lines else ""
            table.append({"key": pending_key, "value": value})
            unlabeled.extend(lines[1:])
            pending_key = None
        else:
            unlabeled.extend(lines)

    flush_pending_as_empty()
    return table, unlabeled


def _read_document_meta(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "filename": record.get("filename") if isinstance(record.get("filename"), str) else None,
        "fileType": record.get("file_type") if isinstance(record.get("file_type"), str) else None,
        "pageCount": record.get("page_count") if isinstance(record.get("page_count"), (int, float)) else None,
    }


def _extract_markdown_text(parsed: Any) -> tuple[str, dict[str, Any]] | None:
    """Supports the plain {"markdown": "..."} shape and PaddleOCR-VL/PP-StructureV3's nested
    {"markdown": {"markdown_texts": "..."}}."""
    if isinstance(parsed, str):
        return parsed, {}

    if not isinstance(parsed, dict):
        return None

    document = _read_document_meta(parsed)

    if isinstance(parsed.get("markdown"), str):
        return parsed["markdown"], document

    if isinstance(parsed.get("markdown_texts"), str):
        return parsed["markdown_texts"], document

    markdown = parsed.get("markdown")
    if isinstance(markdown, dict) and isinstance(markdown.get("markdown_texts"), str):
        return markdown["markdown_texts"], document

    return None


def convert_ocr_response_to_json(input_text: str) -> dict[str, Any]:
    """Converts a document-parsing OCR response into structured JSON.

    Accepts the full {"filename", "file_type", "page_count", "markdown"} response shape, or
    just the raw OCR'd text pasted on its own with no wrapping JSON.
    """
    trimmed = input_text.strip()
    if not trimmed:
        return {"success": False, "error": "Paste an OCR response to convert."}

    try:
        parsed = json.loads(trimmed)
        extracted = _extract_markdown_text(parsed)
        if extracted is None:
            return {
                "success": False,
                "error": 'Valid JSON, but no "markdown" (or "markdown_texts") text field was found.',
            }
        markdown_text, document = extracted
    except json.JSONDecodeError:
        # Not JSON -- treat the whole input as the raw OCR'd text itself.
        markdown_text, document = trimmed, {}

    table, unlabeled = parse_ocr_text_to_table(markdown_text)

    return {
        "success": True,
        "data": {"document": document, "table": table, "unlabeled": unlabeled},
    }


if __name__ == "__main__":
    # Replace this with your own OCR response (e.g. json.dumps(paddle_result)).
    example = {
        "filename": "example.pdf",
        "file_type": "pdf",
        "page_count": 1,
        "markdown": "Operator:\\n\\nJane Doe\\n\\nTest gas: AIR",
    }

    result = convert_ocr_response_to_json(json.dumps(example))
    print(json.dumps(result, indent=2))
`;
