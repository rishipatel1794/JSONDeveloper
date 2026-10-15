import type { StatusCategory } from "@/lib/tools/http-status-codes/types";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<StatusCategory, string> = {
	informational: "border-info/30 bg-info/10 text-info",
	success: "border-success-border bg-success-muted text-success-muted-foreground",
	redirection: "border-warning/30 bg-warning/10 text-warning",
	"client-error": "border-destructive-border bg-destructive-muted text-destructive-muted-foreground",
	"server-error": "border-destructive-border bg-destructive-muted text-destructive-muted-foreground",
};

const CATEGORY_SHORT_LABELS: Record<StatusCategory, string> = {
	informational: "1xx",
	success: "2xx",
	redirection: "3xx",
	"client-error": "4xx",
	"server-error": "5xx",
};

export function StatusCategoryBadge({ category }: { category: StatusCategory }) {
	return (
		<span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", CATEGORY_STYLES[category])}>
			{CATEGORY_SHORT_LABELS[category]}
		</span>
	);
}
