import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { KeyValueEditor } from "@/components/tools/shared/KeyValueEditor";
import { Button } from "@/components/ui/Button";
import { formatJson } from "@/lib/tools/json/formatter";
import type { ApiBodyType } from "@/lib/api-client/types";
import type { KeyValuePair } from "@/lib/tools/shared/http";
import { cn } from "@/lib/utils";

import { FormDataEditor } from "./FormDataEditor";

const BODY_TYPES: { value: ApiBodyType; label: string }[] = [
	{ value: "none", label: "None" },
	{ value: "json", label: "JSON" },
	{ value: "raw", label: "Raw" },
	{ value: "form-urlencoded", label: "Form URL Encoded" },
	{ value: "form-data", label: "Form Data" },
];

interface RequestBodyProps {
	bodyType: ApiBodyType;
	onBodyTypeChange: (type: ApiBodyType) => void;
	body: string;
	onBodyChange: (value: string) => void;
	formData: KeyValuePair[];
	onFormDataChange: (items: KeyValuePair[]) => void;
}

export function RequestBody({ bodyType, onBodyTypeChange, body, onBodyChange, formData, onFormDataChange }: RequestBodyProps) {
	function handleFormatJson() {
		const result = formatJson(body);
		if (result.success && result.data) onBodyChange(result.data);
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Body type">
				{BODY_TYPES.map(option => (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={bodyType === option.value}
						onClick={() => onBodyTypeChange(option.value)}
						className={cn(
							"rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							bodyType === option.value
								? "border-primary/40 bg-primary/10 text-primary-accent"
								: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
						)}
					>
						{option.label}
					</button>
				))}
			</div>

			{bodyType === "none" && <p className="text-sm text-muted-foreground">This request has no body.</p>}

			{(bodyType === "json" || bodyType === "raw") && (
				<div className="overflow-hidden rounded-md border border-border">
					{bodyType === "json" && (
						<div className="flex justify-end border-b border-border bg-secondary px-2 py-1.5">
							<Button onClick={handleFormatJson} variant="ghost" size="sm">
								Format JSON
							</Button>
						</div>
					)}
					<CodeEditor
						value={body}
						onChange={onBodyChange}
						language={bodyType === "json" ? "json" : "plaintext"}
						height="220px"
						placeholder={bodyType === "json" ? "Paste or type JSON here…" : "Enter raw request body…"}
					/>
				</div>
			)}

			{bodyType === "form-urlencoded" && (
				<KeyValueEditor
					items={formData}
					onChange={onFormDataChange}
					keyPlaceholder="Key"
					valuePlaceholder="Value"
					addLabel="Add Field"
					aria-label="Form fields"
				/>
			)}

			{bodyType === "form-data" && <FormDataEditor items={formData} onChange={onFormDataChange} />}
		</div>
	);
}
