import { Search } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface GraphControlsProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onExpandAll: () => void;
	onCollapseAll: () => void;
	maxDepth: number;
	depthLimit: number | null;
	onDepthLimitChange: (depth: number | null) => void;
	onExportSvg: () => void;
	onExportPng: () => void;
	onExportMermaid: () => void;
	nodeCount: number;
	truncated: boolean;
}

export function GraphControls({
	searchQuery,
	onSearchChange,
	onExpandAll,
	onCollapseAll,
	maxDepth,
	depthLimit,
	onDepthLimitChange,
	onExportSvg,
	onExportPng,
	onExportMermaid,
	nodeCount,
	truncated,
}: GraphControlsProps) {
	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary px-3 py-2">
			<div className="relative">
				<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
				<input
					type="search"
					value={searchQuery}
					onChange={event => onSearchChange(event.target.value)}
					placeholder="Search keys or values…"
					aria-label="Search graph nodes"
					className="w-48 rounded-md border border-border bg-card py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>

			<Button onClick={onExpandAll} variant="outline" size="sm">
				Expand all
			</Button>
			<Button onClick={onCollapseAll} variant="outline" size="sm">
				Collapse all
			</Button>

			<label className="flex items-center gap-1.5 text-xs text-muted-foreground">
				Depth
				<select
					value={depthLimit ?? ""}
					onChange={event => onDepthLimitChange(event.target.value ? Number(event.target.value) : null)}
					className="rounded-md border border-border bg-card px-1.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<option value="">All ({maxDepth})</option>
					{Array.from({ length: maxDepth }, (_, i) => i + 1).map(depth => (
						<option key={depth} value={depth}>
							{depth}
						</option>
					))}
				</select>
			</label>

			<div className="ml-auto flex items-center gap-1.5">
				<Button onClick={onExportSvg} variant="ghost" size="sm">
					Export SVG
				</Button>
				<Button onClick={onExportPng} variant="ghost" size="sm">
					Export PNG
				</Button>
				<Button onClick={onExportMermaid} variant="ghost" size="sm">
					Export Mermaid
				</Button>
			</div>

			<span className="w-full text-[11px] text-subtle-foreground">
				{nodeCount.toLocaleString()} nodes visible{truncated ? " (truncated for performance — collapse branches or narrow your search)" : ""}
			</span>
		</div>
	);
}
