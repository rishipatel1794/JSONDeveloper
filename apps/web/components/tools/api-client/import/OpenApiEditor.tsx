import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { detectFormat } from "@/lib/api-client/import/openapi-parser";

interface OpenApiEditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function OpenApiEditor({ value, onChange }: OpenApiEditorProps) {
	const language = value.trim() ? detectFormat(value) : "yaml";

	return (
		<div className="overflow-hidden rounded-md border border-border">
			<CodeEditor
				value={value}
				onChange={onChange}
				language={language}
				height="320px"
				placeholder={"Paste an OpenAPI or Swagger document (JSON or YAML)…"}
			/>
		</div>
	);
}
