import { CopyButton } from "@/components/ui/CopyButton";
import type { DecodedJwt } from "@/lib/tools/jwt/types";

interface JwtActionsProps {
	decoded: DecodedJwt;
}

export function JwtActions({ decoded }: JwtActionsProps) {
	const headerJson = JSON.stringify(decoded.header, null, 2);
	const payloadJson = JSON.stringify(decoded.payload, null, 2);
	const all = `Header:\n${headerJson}\n\nPayload:\n${payloadJson}\n\nSignature:\n${decoded.signature}`;

	return (
		<div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
			<span className="px-1 text-xs font-medium uppercase tracking-wide text-subtle-foreground">Quick copy</span>
			<CopyButton value={headerJson} label="Copy Header" />
			<CopyButton value={payloadJson} label="Copy Payload" />
			<CopyButton value={decoded.signature} label="Copy Signature" />
			<CopyButton value={all} label="Copy All" className="ml-auto" />
		</div>
	);
}
