import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { LARGE_JSON_NOTICE } from "@/lib/tools/json-validator/validator";
import type { JsonValidationResult } from "@/lib/tools/json-validator/types";

import { ErrorDetails } from "./ErrorDetails";

interface ValidationResultProps {
	result: JsonValidationResult;
}

export function ValidationResult({ result }: ValidationResultProps) {
	return (
		<div className="space-y-3">
			{result.valid ? (
				<ToolAlert variant="success" title="Valid JSON">
					JSON is syntactically valid.
				</ToolAlert>
			) : (
				<ToolAlert variant="error" title="Invalid JSON">
					{result.error ? <ErrorDetails error={result.error} contextLines={result.contextLines} /> : "This input is not valid JSON."}
				</ToolAlert>
			)}

			{result.limitedAnalysis && <ToolAlert variant="warning">{LARGE_JSON_NOTICE}</ToolAlert>}
		</div>
	);
}
