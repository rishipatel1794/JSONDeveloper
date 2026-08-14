import { Hash } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { CopyButton } from "@/components/ui/CopyButton";

interface JwtSignatureProps {
	signature: string;
}

export function JwtSignature({ signature }: JwtSignatureProps) {
	return (
		<ToolPanel title="Signature" icon={Hash} action={<CopyButton value={signature} label="Copy" />}>
			<p className="break-all p-4 font-mono text-sm text-foreground">{signature}</p>
		</ToolPanel>
	);
}
