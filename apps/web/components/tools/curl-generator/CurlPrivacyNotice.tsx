import { Lock } from "lucide-react";

export function CurlPrivacyNotice() {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
			<Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
			<div>
				<p className="font-medium text-foreground">Privacy notice</p>
				<p className="mt-0.5 text-muted-foreground">
					Your request configuration — including tokens, passwords, and cookies — stays in your browser. Nothing is sent
					to our server, and the request is never actually executed.
				</p>
			</div>
		</div>
	);
}
