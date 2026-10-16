import { ListTree } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { TokenRow } from "@/lib/tools/regex-explainer/tokenize";

export function TokenBreakdownTable({ rows }: { rows: TokenRow[] }) {
	return (
		<ToolPanel title="Token-by-token breakdown" icon={ListTree}>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-border bg-secondary">
							<th className="px-3 py-2 font-semibold text-foreground">Token</th>
							<th className="px-3 py-2 font-semibold text-foreground">Type</th>
							<th className="px-3 py-2 font-semibold text-foreground">Explanation</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index) => (
							<tr key={index} className="border-b border-border-subtle last:border-b-0">
								<td className="px-3 py-2 align-top" style={{ paddingLeft: `${12 + row.depth * 16}px` }}>
									<code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">{row.raw}</code>
								</td>
								<td className="px-3 py-2 align-top text-xs text-muted-foreground">{row.type}</td>
								<td className="px-3 py-2 align-top text-muted-foreground">{row.meaning}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ToolPanel>
	);
}
