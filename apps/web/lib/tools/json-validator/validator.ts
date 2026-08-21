import { computeStatistics } from "./analyzer";
import { parseJsonWithDiagnostics } from "./json-parser";
import type { ContextLine, JsonSyntaxError, JsonValidationResult, JsonValue } from "./types";
import { computeUtf8ByteLength } from "./utils";

/** Beyond this input size, skip the (slower) hand-rolled diagnostic parser and duplicate-key scan — native `JSON.parse` alone still tells us whether the document is valid. */
const LARGE_INPUT_THRESHOLD_BYTES = 2 * 1024 * 1024;

export const LARGE_JSON_NOTICE = "Large JSON detected. Some analysis features may be limited for performance.";

function genericError(rawMessage: string): JsonSyntaxError {
	return { message: rawMessage, friendlyMessage: rawMessage, line: 1, column: 1, position: 0 };
}

function buildContextLines(input: string, errorLine: number, radius = 2): ContextLine[] {
	const lines = input.split("\n");
	const start = Math.max(1, errorLine - radius);
	const end = Math.min(lines.length, errorLine + radius);

	const context: ContextLine[] = [];
	for (let lineNumber = start; lineNumber <= end; lineNumber++) {
		context.push({ lineNumber, text: lines[lineNumber - 1] ?? "", isErrorLine: lineNumber === errorLine });
	}
	return context;
}

/** The single entry point: parses, validates, and (for valid input) analyzes a JSON string. Never throws. */
export function validateAndAnalyze(input: string): JsonValidationResult {
	if (!input.trim()) {
		return { valid: false, duplicates: [], limitedAnalysis: false };
	}

	const sizeIsLarge = computeUtf8ByteLength(input) > LARGE_INPUT_THRESHOLD_BYTES;

	let value: JsonValue;
	try {
		value = JSON.parse(input) as JsonValue;
	} catch (nativeError) {
		const fallback = genericError(nativeError instanceof Error ? nativeError.message : "Invalid JSON");

		if (sizeIsLarge) {
			return { valid: false, error: fallback, duplicates: [], limitedAnalysis: true };
		}

		const diagnostic = parseJsonWithDiagnostics(input);
		const error = diagnostic.error ?? fallback;

		return {
			valid: false,
			error,
			contextLines: buildContextLines(input, error.line),
			duplicates: diagnostic.duplicates,
			limitedAnalysis: false,
		};
	}

	const duplicates = sizeIsLarge ? [] : parseJsonWithDiagnostics(input).duplicates;
	const { statistics, truncated } = computeStatistics(value, input);

	return { valid: true, value, statistics, duplicates, limitedAnalysis: sizeIsLarge || truncated };
}
