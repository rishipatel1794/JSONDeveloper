import { MessageSquareText } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";

export function PlainEnglishSummary({ summary }: { summary: string }) {
	return (
		<ToolPanel title="Plain-English explanation" icon={MessageSquareText}>
			<p className="p-4 text-sm leading-relaxed text-foreground">{summary}</p>
		</ToolPanel>
	);
}
