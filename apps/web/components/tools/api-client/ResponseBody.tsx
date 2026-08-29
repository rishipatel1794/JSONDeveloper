import { CodeEditor } from "@/components/tools/shared/CodeEditor";

interface ResponseBodyProps {
	value: string;
	language: string;
}

/**
 * Always renders the response as text inside the read-only Monaco editor — never
 * dangerouslySetInnerHTML, never an iframe. An HTML or SVG response is untrusted content and must
 * never be parsed or executed, only displayed as text (with syntax highlighting for readability).
 */
export function ResponseBody({ value, language }: ResponseBodyProps) {
	if (!value) {
		return <p className="rounded-md border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">No response body.</p>;
	}

	return (
		<div className="response-readonly-editor">
			<CodeEditor value={value} onChange={() => {}} readOnly language={language} height="360px" placeholder="No response body" />
		</div>
	);
}
