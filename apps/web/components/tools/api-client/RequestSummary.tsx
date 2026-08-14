import { ClipboardList } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { ApiRequestConfig } from "@/lib/api-client/types";

const BODY_LABELS: Record<ApiRequestConfig["bodyType"], string> = {
	none: "None",
	json: "JSON",
	raw: "Raw Text",
	"form-urlencoded": "Form URL Encoded",
	"form-data": "Form Data",
};

const AUTH_LABELS: Record<ApiRequestConfig["auth"]["type"], string> = {
	none: "None",
	bearer: "Bearer",
	basic: "Basic",
	"api-key": "API Key",
};

interface RequestSummaryProps {
	request: ApiRequestConfig;
}

export function RequestSummary({ request }: RequestSummaryProps) {
	const enabledHeaders = request.headers.filter(h => h.enabled).length;
	const enabledParams = request.queryParams.filter(p => p.enabled).length;

	const rows: [string, string][] = [
		["Method", request.method],
		["URL", request.url || "—"],
		["Query Params", String(enabledParams)],
		["Headers", String(enabledHeaders)],
		["Body", BODY_LABELS[request.bodyType]],
		["Auth", AUTH_LABELS[request.auth.type]],
	];

	return (
		<ToolPanel title="Request Summary" icon={ClipboardList}>
			<div className="divide-y divide-border-subtle px-4">
				{rows.map(([label, value]) => (
					<div key={label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
						<span className="text-muted-foreground">{label}</span>
						<span className="truncate text-right font-medium text-foreground">{value}</span>
					</div>
				))}
			</div>
		</ToolPanel>
	);
}
