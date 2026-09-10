import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedTool {
	name: string;
	href: string;
	description: string;
}

interface RelatedToolsProps {
	tools: RelatedTool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Related tools</h2>

				<div className="mt-6 grid gap-3 sm:grid-cols-2">
					{tools.map(tool => (
						<Link
							key={tool.href}
							href={tool.href}
							className="group rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated"
						>
							<span className="flex items-center justify-between text-sm font-semibold text-foreground">
								{tool.name}
								<ArrowRight className="size-3.5 shrink-0 text-primary-accent transition-transform group-hover:translate-x-0.5" />
							</span>
							<span className="mt-1 block text-sm text-muted-foreground">{tool.description}</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
