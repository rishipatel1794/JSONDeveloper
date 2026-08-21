"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ListTree } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { expandedAncestorPaths, formatTreeValueLabel, searchJsonTree } from "@/lib/tools/json-validator/json-path";
import type { JsonTreeNode } from "@/lib/tools/json-validator/types";
import { cn } from "@/lib/utils";

const CHILDREN_PER_PAGE = 100;

interface JsonTreeProps {
	root: JsonTreeNode;
	truncated: boolean;
	selectedPath: string | null;
	onSelect: (node: JsonTreeNode) => void;
	searchQuery: string;
}

export function JsonTree({ root, truncated, selectedPath, onSelect, searchQuery }: JsonTreeProps) {
	const matches = useMemo(() => searchJsonTree(root, searchQuery), [root, searchQuery]);
	const autoExpanded = useMemo(() => expandedAncestorPaths(matches), [matches]);

	const [expanded, setExpanded] = useState<Set<string>>(() => new Set([""]));
	const [collapsedOverride, setCollapsedOverride] = useState<Set<string>>(() => new Set());

	function isExpanded(path: string): boolean {
		if (collapsedOverride.has(path)) return false;
		return expanded.has(path) || autoExpanded.has(path) || (searchQuery.trim() !== "" && matches.has(path));
	}

	function toggle(path: string) {
		const willExpand = !isExpanded(path);
		setCollapsedOverride(current => {
			const next = new Set(current);
			if (willExpand) next.delete(path);
			else next.add(path);
			return next;
		});
		setExpanded(current => {
			const next = new Set(current);
			if (willExpand) next.add(path);
			return next;
		});
	}

	function expandAll() {
		setCollapsedOverride(new Set());
		const all = new Set<string>();
		function collect(node: JsonTreeNode) {
			all.add(node.path);
			for (const child of node.children) collect(child);
		}
		collect(root);
		setExpanded(all);
	}

	function collapseAll() {
		setExpanded(new Set([""]));
		setCollapsedOverride(new Set());
	}

	return (
		<ToolPanel
			title="Structure"
			icon={ListTree}
			action={
				<div className="flex gap-1.5">
					<Button onClick={expandAll} variant="ghost" size="sm" disabled={truncated}>
						Expand all
					</Button>
					<Button onClick={collapseAll} variant="ghost" size="sm">
						Collapse all
					</Button>
				</div>
			}
		>
			<div className="max-h-[28rem] overflow-y-auto p-2 font-mono text-sm">
				<JsonTreeRow
					node={root}
					depth={0}
					isExpanded={isExpanded}
					onToggle={toggle}
					onSelect={onSelect}
					selectedPath={selectedPath}
					matches={matches}
					hasQuery={searchQuery.trim() !== ""}
				/>
			</div>

			{truncated && (
				<p className="border-t border-border-subtle px-4 py-2 text-xs text-subtle-foreground">
					This document is very large — the tree is capped for performance.
				</p>
			)}
		</ToolPanel>
	);
}

interface JsonTreeRowProps {
	node: JsonTreeNode;
	depth: number;
	isExpanded: (path: string) => boolean;
	onToggle: (path: string) => void;
	onSelect: (node: JsonTreeNode) => void;
	selectedPath: string | null;
	matches: Set<string>;
	hasQuery: boolean;
}

function JsonTreeRow({ node, depth, isExpanded, onToggle, onSelect, selectedPath, matches, hasQuery }: JsonTreeRowProps) {
	const [visibleCount, setVisibleCount] = useState(CHILDREN_PER_PAGE);
	const hasChildren = node.children.length > 0;
	const expanded = hasChildren && isExpanded(node.path);
	const isMatch = hasQuery && matches.has(node.path);
	const visibleChildren = node.children.slice(0, visibleCount);
	const remaining = node.children.length - visibleChildren.length;

	return (
		<div>
			<div
				role="treeitem"
				aria-selected={selectedPath === node.path}
				aria-expanded={hasChildren ? expanded : undefined}
				style={{ paddingLeft: `${depth * 16}px` }}
				className={cn(
					"flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 hover:bg-secondary",
					selectedPath === node.path && "bg-primary/10",
					isMatch && "ring-1 ring-warning/60",
				)}
				onClick={() => onSelect(node)}
			>
				{hasChildren ? (
					<button
						type="button"
						onClick={event => {
							event.stopPropagation();
							onToggle(node.path);
						}}
						aria-label={expanded ? `Collapse ${node.key}` : `Expand ${node.key}`}
						className="shrink-0 text-muted-foreground"
					>
						{expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
					</button>
				) : (
					<span className="inline-block size-3.5 shrink-0" />
				)}

				<span className="shrink-0 text-primary-accent">{node.key}</span>
				<span className="shrink-0 text-subtle-foreground">:</span>
				<span className={cn("truncate", node.type === "string" ? "text-success" : "text-foreground")}>{formatTreeValueLabel(node)}</span>
				<span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-subtle-foreground">{node.type}</span>
			</div>

			{expanded && (
				<div role="group">
					{visibleChildren.map(child => (
						<JsonTreeRow
							key={child.path}
							node={child}
							depth={depth + 1}
							isExpanded={isExpanded}
							onToggle={onToggle}
							onSelect={onSelect}
							selectedPath={selectedPath}
							matches={matches}
							hasQuery={hasQuery}
						/>
					))}

					{remaining > 0 && (
						<button
							type="button"
							style={{ paddingLeft: `${(depth + 1) * 16}px` }}
							onClick={() => setVisibleCount(count => count + CHILDREN_PER_PAGE)}
							className="py-1 text-xs text-primary-accent hover:underline"
						>
							Show {Math.min(remaining, CHILDREN_PER_PAGE)} more…
						</button>
					)}
				</div>
			)}
		</div>
	);
}
