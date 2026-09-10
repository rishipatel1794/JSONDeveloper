import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getCategory, type ToolDefinition } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

interface ToolCardProps {
	tool: ToolDefinition;
}

export function ToolCard({ tool }: ToolCardProps) {
	const Icon = tool.icon;
	const categoryName = getCategory(tool.category)?.name ?? tool.category;

	const content = (
		<>
			<div className="flex items-start justify-between gap-2">
				<span className="flex size-9 items-center justify-center rounded-md border border-border-subtle bg-secondary text-primary">
					<Icon className="size-4" />
				</span>
				{tool.available && (
					<ArrowUpRight
						aria-hidden="true"
						className="size-4 shrink-0 text-subtle-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
					/>
				)}
			</div>

			<span className="mt-3 block text-sm font-semibold text-foreground">{tool.name}</span>
			<span className="mt-1 block text-sm text-muted-foreground">{tool.description}</span>

			<span className="mt-4 block font-mono text-[10px] font-medium tracking-widest text-subtle-foreground">
				{categoryName.toUpperCase()}
				{!tool.available && <span className="ml-1.5 text-warning">· SOON</span>}
			</span>
		</>
	);

	if (!tool.available) {
		return (
			<div className="rounded-lg border border-border-subtle bg-card p-4 opacity-70" aria-disabled="true">
				{content}
			</div>
		);
	}

	return (
		<Link
			href={tool.href}
			className={cn(
				"group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-elevated",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
			)}
		>
			{content}
		</Link>
	);
}
