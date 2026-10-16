import { Code2, Download } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { buildCodeSnippets } from "@/lib/tools/regex-generator/codeExport";

interface RegexGeneratorOutputProps {
	pattern: string;
	flags: string;
}

export function RegexGeneratorOutput({ pattern, flags }: RegexGeneratorOutputProps) {
	if (!pattern) return null;

	const snippets = buildCodeSnippets(pattern, flags);

	function handleDownload() {
		downloadTextFile(`Pattern: ${pattern}\nFlags: ${flags || "(none)"}\n`, "regex-pattern.txt", "text/plain");
	}

	return (
		<ToolPanel title="Generated Pattern" icon={Code2}>
			<div className="space-y-4 p-4">
				<div className="flex flex-wrap items-center gap-2">
					<code className="rounded-md bg-secondary px-3 py-1.5 font-mono text-sm text-foreground">
						/{pattern}/{flags}
					</code>
					<CopyButton value={pattern} label="Copy pattern" />
					<CopyButton value={`/${pattern}/${flags}`} label="Copy as literal" />
					<button
						type="button"
						onClick={handleDownload}
						className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
					>
						<Download className="size-3.5" />
						Download .txt
					</button>
				</div>

				<div className="grid gap-3 md:grid-cols-2">
					{snippets.map(snippet => (
						<div key={snippet.language} className="rounded-lg border border-border-subtle">
							<div className="flex items-center justify-between border-b border-border-subtle px-3 py-1.5">
								<span className="text-xs font-medium text-muted-foreground">{snippet.label}</span>
								<CopyButton value={snippet.code} label={`Copy as ${snippet.label}`} />
							</div>
							<pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-foreground">{snippet.code}</pre>
							{snippet.warnings.length > 0 && (
								<div className="border-t border-border-subtle bg-warning/10 px-3 py-2 text-xs text-warning">
									{snippet.warnings.map(warning => (
										<p key={warning}>{warning}</p>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</ToolPanel>
	);
}
