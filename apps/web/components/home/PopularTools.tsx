import { popularTools } from "@/lib/tools/registry";
import { Reveal } from "@/components/ui/Reveal";

import { SectionEyebrow } from "./SectionEyebrow";
import { ToolCard } from "./ToolCard";

export function PopularTools() {
	return (
		<section id="popular-tools" className="scroll-mt-16 border-b border-border">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<Reveal className="mx-auto max-w-2xl text-center">
					<SectionEyebrow index={1} label="POPULAR TOOLS" />
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Popular developer tools</h2>
					<p className="mt-2 text-muted-foreground">Tools developers use every day.</p>
				</Reveal>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{popularTools.map((tool, index) => (
						<Reveal key={tool.slug} delay={index * 60}>
							<ToolCard tool={tool} />
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
