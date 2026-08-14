import type { HttpMethod } from "@/lib/tools/shared/http";
import { cn } from "@/lib/utils";

const METHOD_COLORS: Record<HttpMethod, string> = {
	GET: "text-success",
	POST: "text-primary-accent",
	PUT: "text-warning",
	PATCH: "text-warning",
	DELETE: "text-destructive",
	HEAD: "text-muted-foreground",
	OPTIONS: "text-muted-foreground",
};

interface MethodBadgeProps {
	method: HttpMethod;
	className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
	return <span className={cn("w-12 shrink-0 font-mono text-[10px] font-bold", METHOD_COLORS[method], className)}>{method}</span>;
}
