import { popularTools } from "@/lib/tools/registry";

import { ToolCard } from "./ToolCard";

export function PopularTools() {
	return (
		<section id="popular-tools" className="scroll-mt-16 border-b border-border">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Popular developer tools</h2>
					<p className="mt-2 text-muted-foreground">Tools developers use every day.</p>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{popularTools.map(tool => (
						<ToolCard key={tool.slug} tool={tool} />
					))}
				</div>
			</div>
		</section>
	);
}
