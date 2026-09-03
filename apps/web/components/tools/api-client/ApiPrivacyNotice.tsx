import { ShieldAlert } from "lucide-react";

export function ApiPrivacyNotice() {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm">
			<ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
			<div>
				<p className="font-medium text-foreground">Request privacy</p>
				<p className="mt-0.5 text-muted-foreground">
					Requests are sent through our API proxy so this tool can reach APIs that block direct browser requests. Unlike
					our purely local tools, this data does pass through our server on its way to the target API. Avoid sending
					highly sensitive production credentials unless you understand that. The one exception is a localhost or
					private-network target — those go straight from your browser, since our server could never reach them anyway.
				</p>
			</div>
		</div>
	);
}
