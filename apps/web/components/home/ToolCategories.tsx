import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { categories, getCategoryToolCount } from "@/lib/tools/registry";

import { SectionEyebrow } from "./SectionEyebrow";

export function ToolCategories() {
	return (
		<section id="categories" className="scroll-mt-16 border-b border-border bg-muted/40">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					<SectionEyebrow index={2} label="CATEGORIES" />
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Tool categories</h2>
					<p className="mt-2 text-muted-foreground">Everything organized the way developers think about their work.</p>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{categories.map(category => {
						const Icon = category.icon;
						const count = getCategoryToolCount(category.slug);

						return (
							<Link
								key={category.slug}
								href={`/category/${category.slug}`}
								className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-elevated hover:shadow-[0_0_0_1px_var(--color-primary)_inset]"
							>
								<span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
									<Icon className="size-5" />
								</span>

								<span className="mt-3 block text-sm font-semibold text-foreground">{category.name}</span>
								<span className="mt-1 block text-sm text-muted-foreground">{category.description}</span>

								<span className="mt-4 flex items-center justify-between text-sm">
									<span className="text-subtle-foreground">
										{count} tool{count === 1 ? "" : "s"}
									</span>
									<ArrowRight className="size-3.5 text-primary-accent transition-transform group-hover:translate-x-0.5" />
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
