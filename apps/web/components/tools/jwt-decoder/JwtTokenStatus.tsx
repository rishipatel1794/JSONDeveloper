import { AlertTriangle, CheckCircle2, Clock, Info } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { JwtHeader, JwtPayload } from "@/lib/tools/jwt/types";
import { formatTimestamp, isExpired, isNotYetValid } from "@/lib/tools/jwt/utils";
import { cn } from "@/lib/utils";

interface JwtTokenStatusProps {
	header: JwtHeader;
	payload: JwtPayload;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-4 py-2.5 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="text-right font-medium text-foreground">{value}</span>
		</div>
	);
}

export function JwtTokenStatus({ header, payload }: JwtTokenStatusProps) {
	const expired = isExpired(payload.exp);
	const notYetValid = isNotYetValid(payload.nbf);

	return (
		<ToolPanel title="Token Information" icon={Info}>
			<div className="divide-y divide-border-subtle px-4">
				<Row label="Algorithm" value={header.alg ?? "Not specified"} />
				<Row label="Type" value={header.typ ?? "Not specified"} />
				<Row label="Issued At" value={typeof payload.iat === "number" ? formatTimestamp(payload.iat) : "—"} />
				<Row label="Expires At" value={typeof payload.exp === "number" ? formatTimestamp(payload.exp) : "—"} />
				{typeof payload.nbf === "number" && <Row label="Valid From" value={formatTimestamp(payload.nbf)} />}

				<div className="flex items-center justify-between gap-4 py-3 text-sm">
					<span className="text-muted-foreground">Status</span>
					<StatusBadge expired={expired} notYetValid={notYetValid} />
				</div>
			</div>

			{notYetValid && (
				<div className="flex items-center gap-2 border-t border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
					<AlertTriangle className="size-4 shrink-0" />
					Token is not active yet
				</div>
			)}
		</ToolPanel>
	);
}

function StatusBadge({ expired, notYetValid }: { expired: boolean | null; notYetValid: boolean | null }) {
	if (expired === null) {
		return <span className="text-subtle-foreground">No expiration claim</span>;
	}

	if (expired) {
		return (
			<span className={cn("inline-flex items-center gap-1.5 font-medium text-destructive")}>
				<AlertTriangle className="size-4" /> Expired
			</span>
		);
	}

	if (notYetValid) {
		return (
			<span className={cn("inline-flex items-center gap-1.5 font-medium text-warning")}>
				<Clock className="size-4" /> Not active yet
			</span>
		);
	}

	return (
		<span className={cn("inline-flex items-center gap-1.5 font-medium text-success")}>
			<CheckCircle2 className="size-4" /> Not expired
		</span>
	);
}
