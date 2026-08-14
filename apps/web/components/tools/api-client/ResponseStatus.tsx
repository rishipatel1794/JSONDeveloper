import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import { formatBytes } from "@/lib/api-client/utils";
import { cn } from "@/lib/utils";

interface ResponseStatusProps {
	status: number;
	statusText: string;
	duration: number;
	size: number;
}

type Tone = "success" | "warning" | "error" | "neutral";

function getTone(status: number): Tone {
	if (status >= 200 && status < 300) return "success";
	if (status >= 300 && status < 400) return "warning";
	if (status >= 400) return "error";
	return "neutral";
}

const TONE_ICON: Record<Tone, typeof CheckCircle2> = {
	success: CheckCircle2,
	warning: AlertTriangle,
	error: AlertCircle,
	neutral: AlertTriangle,
};

const TONE_CLASSES: Record<Tone, string> = {
	success: "text-success",
	warning: "text-warning",
	error: "text-destructive",
	neutral: "text-muted-foreground",
};

export function ResponseStatus({ status, statusText, duration, size }: ResponseStatusProps) {
	const tone = getTone(status);
	const Icon = TONE_ICON[tone];

	return (
		<div className="flex flex-wrap items-center gap-4 text-sm">
			<span className={cn("inline-flex items-center gap-1.5 font-semibold", TONE_CLASSES[tone])}>
				<Icon className="size-4" />
				{status} {statusText}
			</span>
			<span className="text-muted-foreground">{duration} ms</span>
			<span className="text-muted-foreground">{formatBytes(size)}</span>
		</div>
	);
}
