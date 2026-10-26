import { Table2 } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { buildTableData, formatCellValue } from "@/lib/tools/json-visualizer/tableData";
import type { JsonValue } from "@/lib/tools/json-validator/types";

export function TableView({ value }: { value: JsonValue }) {
	const table = buildTableData(value);

	if (!table) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
				<p className="text-sm font-medium text-foreground">Table view needs an array at the root</p>
				<p className="mt-1 text-sm text-muted-foreground">Your JSON&apos;s root is not an array — switch to Tree or Graph view to explore it instead.</p>
			</div>
		);
	}

	return (
		<ToolPanel title={`Table (${table.rows.length} rows)`} icon={Table2}>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-border bg-secondary">
							<th className="px-3 py-2 font-semibold text-foreground">#</th>
							{table.columns.map(column => (
								<th key={column} className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">
									{column}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{table.rows.map((row, index) => (
							<tr key={row.path} className="border-b border-border-subtle last:border-b-0 hover:bg-secondary">
								<td className="px-3 py-2 align-top font-mono text-xs text-subtle-foreground">{index}</td>
								{table.columns.map(column => {
									const cellValue = row.cells[column];
									const text = formatCellValue(cellValue);
									return (
										<td key={column} className="group px-3 py-2 align-top font-mono text-xs text-foreground">
											<div className="flex items-center gap-1.5">
												<span className="truncate">{text || "—"}</span>
												{cellValue !== undefined && (
													<span className="opacity-0 transition-opacity group-hover:opacity-100">
														<CopyButton value={`${row.path}.${column}`} ariaLabel={`Copy path for ${column} in row ${index}`} />
													</span>
												)}
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ToolPanel>
	);
}
