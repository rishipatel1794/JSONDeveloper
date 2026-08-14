import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ToolDefinition } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

interface ToolCardProps {
	tool: ToolDefinition;
}

export function ToolCard({ tool }: ToolCardProps) {
	const Icon = tool.icon;

	const content = (
		<>
			<span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
				<Icon className="size-5" />
			</span>

			<span className="mt-3 block text-sm font-semibold text-foreground">{tool.name}</span>
			<span className="mt-1 block text-sm text-muted-foreground">{tool.description}</span>

			<span
				className={cn(
					"mt-4 inline-flex items-center gap-1 text-sm font-medium",
					tool.available ? "text-primary-accent" : "text-subtle-foreground",
				)}
			>
				{tool.available ? (
					<>
						Open tool <ArrowRight className="size-3.5" />
					</>
				) : (
					"Coming soon"
				)}
			</span>
		</>
	);

	if (!tool.available) {
		return (
			<div className="rounded-lg border border-border-subtle bg-card p-5 opacity-70" aria-disabled="true">
				{content}
			</div>
		);
	}

	return (
		<Link
			href={tool.href}
			className="group rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated"
		>
			{content}
		</Link>
	);
}
