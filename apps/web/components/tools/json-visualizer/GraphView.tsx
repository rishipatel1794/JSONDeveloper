"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Background, Controls, ReactFlow, ReactFlowProvider, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { downloadTextFile } from "@/lib/download";
import { expandedAncestorPaths, getValueAtPath, searchJsonTree } from "@/lib/tools/json-validator/json-path";
import type { JsonTreeNode, JsonValue } from "@/lib/tools/json-validator/types";
import { buildGraphSvg } from "@/lib/tools/json-visualizer/svgExport";
import { buildMermaidDiagram } from "@/lib/tools/json-visualizer/mermaidExport";
import { buildGraphLayout } from "@/lib/tools/json-visualizer/treeLayout";
import { GraphControls } from "./GraphControls";
import { GraphNodeCard, type GraphNodeFlowData } from "./GraphNodeCard";
import { NodeInspectorPanel } from "./NodeInspectorPanel";

const NODE_TYPES = { jsonNode: GraphNodeCard };

function collectMaxDepth(node: JsonTreeNode): number {
	if (node.children.length === 0) return node.depth;
	return Math.max(...node.children.map(collectMaxDepth));
}

function pathsAtDepth(node: JsonTreeNode, depth: number, out: Set<string>): void {
	if (node.depth === depth) {
		out.add(node.path);
		return;
	}
	for (const child of node.children) pathsAtDepth(child, depth, out);
}

function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(query.matches);
		const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
		query.addEventListener("change", handler);
		return () => query.removeEventListener("change", handler);
	}, []);
	return reduced;
}

function downloadPngFromSvg(svgMarkup: string, filename: string): void {
	const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml" });
	const url = URL.createObjectURL(svgBlob);
	const image = new Image();

	image.onload = () => {
		const canvas = document.createElement("canvas");
		canvas.width = image.width;
		canvas.height = image.height;
		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.drawImage(image, 0, 0);
			canvas.toBlob(blob => {
				if (!blob) return;
				const pngUrl = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = pngUrl;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				link.remove();
				URL.revokeObjectURL(pngUrl);
			}, "image/png");
		}
		URL.revokeObjectURL(url);
	};

	image.src = url;
}

interface GraphViewProps {
	root: JsonTreeNode;
	value: JsonValue;
}

function GraphViewInner({ root, value }: GraphViewProps) {
	const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => new Set());
	const [selectedPath, setSelectedPath] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [depthLimit, setDepthLimit] = useState<number | null>(null);
	const reducedMotion = usePrefersReducedMotion();

	const maxDepth = useMemo(() => collectMaxDepth(root), [root]);

	const matches = useMemo(() => searchJsonTree(root, searchQuery), [root, searchQuery]);
	const autoExpanded = useMemo(() => expandedAncestorPaths(matches), [matches]);

	const effectiveCollapsed = useMemo(() => {
		const next = new Set(collapsedPaths);
		if (depthLimit !== null) {
			const atDepth = new Set<string>();
			pathsAtDepth(root, depthLimit, atDepth);
			for (const path of atDepth) next.add(path);
		}
		for (const path of autoExpanded) next.delete(path);
		return next;
	}, [collapsedPaths, depthLimit, root, autoExpanded]);

	const layout = useMemo(() => buildGraphLayout(root, effectiveCollapsed), [root, effectiveCollapsed]);

	const nodes: Node[] = useMemo(
		() =>
			layout.nodes.map(layoutNode => {
				const data: GraphNodeFlowData = {
					node: layoutNode.data,
					selected: selectedPath === layoutNode.id,
					highlighted: searchQuery.trim() !== "" && matches.has(layoutNode.data.path),
					onToggleCollapse: path => {
						setCollapsedPaths(current => {
							const next = new Set(current);
							if (next.has(path)) next.delete(path);
							else next.add(path);
							return next;
						});
					},
					onSelect: setSelectedPath,
				};
				return { id: layoutNode.id, type: "jsonNode", position: { x: layoutNode.x, y: layoutNode.y }, data };
			}),
		[layout.nodes, selectedPath, searchQuery, matches],
	);

	const edges: Edge[] = useMemo(
		() =>
			layout.edges.map(edge => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				type: "smoothstep",
				animated: !reducedMotion,
			})),
		[layout.edges, reducedMotion],
	);

	const handleExpandAll = useCallback(() => setCollapsedPaths(new Set()), []);
	const handleCollapseAll = useCallback(() => {
		const collapsible = new Set<string>();
		function walk(node: JsonTreeNode) {
			if (node.children.length > 0 && node.depth > 0) collapsible.add(node.path);
			for (const child of node.children) walk(child);
		}
		walk(root);
		setCollapsedPaths(collapsible);
	}, [root]);

	function handleExportSvg() {
		downloadTextFile(buildGraphSvg(layout), "json-graph.svg", "image/svg+xml");
	}

	function handleExportPng() {
		downloadPngFromSvg(buildGraphSvg(layout), "json-graph.png");
	}

	function handleExportMermaid() {
		const { diagram } = buildMermaidDiagram(root);
		downloadTextFile(diagram, "json-graph.mmd", "text/plain");
	}

	const selectedValue = selectedPath !== null ? getValueAtPath(value, selectedPath) : undefined;

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
			<GraphControls
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onExpandAll={handleExpandAll}
				onCollapseAll={handleCollapseAll}
				maxDepth={maxDepth}
				depthLimit={depthLimit}
				onDepthLimitChange={setDepthLimit}
				onExportSvg={handleExportSvg}
				onExportPng={handleExportPng}
				onExportMermaid={handleExportMermaid}
				nodeCount={layout.nodes.length}
				truncated={layout.truncated}
			/>

			<div style={{ height: 520 }}>
				<ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} fitView proOptions={{ hideAttribution: true }} minZoom={0.1}>
					<Background gap={24} size={1} />
					<Controls showInteractive={false} />
				</ReactFlow>
			</div>

			{selectedPath !== null && (
				<div className="border-t border-border p-3">
					<NodeInspectorPanel path={selectedPath} value={selectedValue} />
				</div>
			)}
		</div>
	);
}

export function GraphView(props: GraphViewProps) {
	return (
		<ReactFlowProvider>
			<GraphViewInner {...props} />
		</ReactFlowProvider>
	);
}
