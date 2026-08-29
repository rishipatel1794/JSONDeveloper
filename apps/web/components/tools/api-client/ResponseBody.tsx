import { CodeEditor } from "@/components/tools/shared/CodeEditor";

interface ResponseBodyProps {
	value: string;
	language: string;
	isRaw?: boolean;
	isLargeResponse?: boolean;
	useMonaco?: boolean;
}

/**
 * Always renders the response as text inside the read-only Monaco editor — never
 * dangerouslySetInnerHTML, never an iframe. An HTML or SVG response is untrusted content and must
 * never be parsed or executed, only displayed as text (with syntax highlighting for readability).
 */
export function ResponseBody({ value, language, isRaw = false, isLargeResponse = false, useMonaco = true }: ResponseBodyProps) {
	if (!value) {
		return <p className="rounded-md border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">No response body.</p>;
	}

	if (!useMonaco || isRaw || isLargeResponse) {
		return (
			<pre
				className="h-90 overflow-auto rounded-md border border-border bg-card p-3 font-mono text-sm text-foreground whitespace-pre"
				style={{ contain: "strict" }}
			>
				{value}
			</pre>
		);
	}

	return (
		<div className="response-readonly-editor">
			<CodeEditor
				value={value}
				onChange={() => {}}
				readOnly
				language={language}
				height="360px"
				placeholder="No response body"
				wordWrap="on"
				optimizeForReadOnly
			/>
		</div>
	);
}
