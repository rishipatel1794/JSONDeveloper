import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getToolsByCategory } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export function FeaturedTools() {
	const jsonTools = getToolsByCategory("json");

	return (
		<section className="border-b border-border bg-muted/40">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">JSON developer toolkit</h2>
					<p className="mt-2 text-muted-foreground">Everything you need to work with JSON, starting with our first tool.</p>
				</div>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
					{jsonTools.map(tool =>
						tool.available ? (
							<Link
								key={tool.slug}
								href={tool.href}
								className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-accent transition-colors hover:bg-primary/20"
							>
								{tool.name}
								<ArrowRight className="size-3.5" />
							</Link>
						) : (
							<span
								key={tool.slug}
								className={cn(
									"inline-flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-sm font-medium text-subtle-foreground",
								)}
							>
								{tool.name}
							</span>
						),
					)}
				</div>
			</div>
		</section>
	);
}
