import { CodeEditor } from "@/components/tools/shared/CodeEditor";

interface CurlBatchEditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function CurlBatchEditor({ value, onChange }: CurlBatchEditorProps) {
	return (
		<div className="overflow-hidden rounded-md border border-border">
			<CodeEditor
				value={value}
				onChange={onChange}
				language="shell"
				height="320px"
				placeholder={"curl --request GET \\\n  --url 'https://api.example.com/users' \\\n  --header 'Authorization: Bearer TOKEN'\n\n(separate multiple commands with a blank line)"}
			/>
		</div>
	);
}
