"use client";

import { useMemo, useState } from "react";
import { Waypoints } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { JsonTree } from "@/components/tools/json-validator/JsonTree";
import { buildJsonTree } from "@/lib/tools/json-validator/json-path";

const SAMPLE = JSON.stringify(
	{
		user: { id: 42, name: "Ada Lovelace", active: true },
		roles: ["admin", "editor"],
		meta: { lastLogin: null },
	},
	null,
	2,
);

/** A real, functional preview — the exact JsonTree component used on /visualizer, not a screenshot or animation. */
export function VisualizerShowcase() {
	const [selectedPath, setSelectedPath] = useState<string | null>(null);
	const tree = useMemo(() => buildJsonTree(JSON.parse(SAMPLE)), []);

	return (
		<section id="visualizer-showcase" className="border-b border-border bg-secondary/30">
			<div className="container mx-auto max-w-5xl px-4 py-16">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">See your JSON&apos;s structure instantly</h2>
					<p className="mt-2 text-sm text-muted-foreground sm:text-base">
						Raw JSON on the left, a live interactive tree on the right — the Visualizer also has a connected node graph and table view.
					</p>
				</div>

				<div className="mt-8 grid gap-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm md:grid-cols-2">
					<div className="border-b border-border md:border-b-0 md:border-r">
						<CodeEditor value={SAMPLE} onChange={() => {}} readOnly optimizeForReadOnly height="280px" />
					</div>
					<div className="p-2">
						<JsonTree root={tree.root} truncated={tree.truncated} selectedPath={selectedPath} onSelect={node => setSelectedPath(node.path)} searchQuery="" />
					</div>
				</div>

				<div className="mt-6 text-center">
					<Button href="/visualizer" variant="outline">
						<Waypoints className="size-4" />
						Open the full Visualizer (tree, table, and graph)
					</Button>
				</div>
			</div>
		</section>
	);
}
