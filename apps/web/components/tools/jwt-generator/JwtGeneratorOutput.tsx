import { AlertTriangle, CheckCircle2, Download, Sparkles } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { JwtHeader } from "@/components/tools/jwt-decoder/JwtHeader";
import { JwtPayload } from "@/components/tools/jwt-decoder/JwtPayload";
import { JwtTokenStatus } from "@/components/tools/jwt-decoder/JwtTokenStatus";
import { downloadTextFile } from "@/lib/download";
import type { JwtHeader as JwtHeaderType, JwtPayload as JwtPayloadType } from "@/lib/tools/jwt/types";

interface JwtGeneratorOutputProps {
	token: string;
	header: JwtHeaderType;
	payload: JwtPayloadType;
	algorithm: string;
	warnings: string[];
	stale: boolean;
}

export function JwtGeneratorOutput({ token, header, payload, algorithm, warnings, stale }: JwtGeneratorOutputProps) {
	return (
		<div className="space-y-4">
			<ToolPanel
				title="Generated Token"
				icon={Sparkles}
				action={<span className="text-xs text-muted-foreground">{token.length} characters</span>}
			>
				<div className="space-y-3 p-3">
					{stale && (
						<div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
							<AlertTriangle className="size-3.5 shrink-0" />
							Inputs changed since this token was generated — click Generate Token to bring it up to date.
						</div>
					)}

					{!stale && warnings.length > 0 && (
						<div className="space-y-1 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
							{warnings.map(warning => (
								<p key={warning}>{warning}</p>
							))}
						</div>
					)}

					{!stale && warnings.length === 0 && (
						<div className="flex items-center gap-2 rounded-md border border-success-border bg-success-muted px-3 py-2 text-xs text-success-muted-foreground">
							<CheckCircle2 className="size-3.5 shrink-0" />
							Signed with {algorithm}.
						</div>
					)}

					<pre className="overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs break-all whitespace-pre-wrap text-foreground">{token}</pre>

					<div className="flex flex-wrap items-center gap-2">
						<CopyButton value={token} label="Copy JWT" />
						<CopyButton value={JSON.stringify(header, null, 2)} label="Copy Header JSON" />
						<CopyButton value={JSON.stringify(payload, null, 2)} label="Copy Payload JSON" />
						<button
							type="button"
							onClick={() => downloadTextFile(token, "token.txt", "text/plain")}
							className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
						>
							<Download className="size-3.5" />
							Download .txt
						</button>
					</div>
				</div>
			</ToolPanel>

			<div className="grid gap-4 lg:grid-cols-2">
				<JwtHeader header={header} />
				<JwtPayload payload={payload} />
			</div>

			<JwtTokenStatus header={header} payload={payload} />
		</div>
	);
}
