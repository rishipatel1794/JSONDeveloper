import { Terminal } from "lucide-react";

import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import type { Shell } from "@/lib/tools/curl/types";

import { ShellSelector } from "./ShellSelector";

interface CurlOutputProps {
	command: string;
	shell: Shell;
	onShellChange: (shell: Shell) => void;
	onDownload: () => void;
}

export function CurlOutput({ command, shell, onShellChange, onDownload }: CurlOutputProps) {
	return (
		<ToolPanel
			title="Generated cURL"
			icon={Terminal}
			action={
				<div className="flex items-center gap-2">
					<ShellSelector value={shell} onChange={onShellChange} />
					<CopyButton value={command} label="Copy" disabled={!command} />
					<Button onClick={onDownload} variant="outline" size="sm" disabled={!command}>
						Download
					</Button>
				</div>
			}
		>
			<CodeEditor value={command} onChange={() => {}} readOnly language="shell" height="220px" placeholder="Generated cURL will appear here" />
		</ToolPanel>
	);
}
