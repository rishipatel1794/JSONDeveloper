import Link from "next/link";
import { Sparkles } from "lucide-react";

import { getNewTools } from "@/lib/tools/registry";

/** Renders nothing once every currently-`isNew` tool's `newUntil` window has passed — no manual cleanup needed. */
export function RecentlyAdded() {
	const newTools = getNewTools();
	if (newTools.length === 0) return null;

	return (
		<section className="border-b border-border">
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<div className="flex items-center gap-2">
					<Sparkles className="size-4 text-primary" aria-hidden="true" />
					<h2 className="text-base font-semibold text-foreground">Recently added</h2>
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{newTools.map(tool => (
						<Link
							key={tool.slug}
							href={tool.href}
							className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
						>
							{tool.name}
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
