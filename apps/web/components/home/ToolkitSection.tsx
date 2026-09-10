import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getToolsByCategory, type CategorySlug } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

import { SectionEyebrow } from "./SectionEyebrow";

interface ToolkitSectionProps {
	category: CategorySlug;
	title: string;
	subtitle: string;
	exploreLabel: string;
	muted?: boolean;
	eyebrow?: { index: number; label: string };
	/** DevOps uses the cooler "info" accent instead of the primary teal, per the design brief's request for a
	 * slightly different treatment while staying in the same system — it's the same token every status/link
	 * elsewhere already uses, not a one-off color. */
	accent?: "primary" | "info";
}

/** A compact tag-style listing of every tool in one category — used for the JSON and DevOps toolkits. */
export function ToolkitSection({ category, title, subtitle, exploreLabel, muted, eyebrow, accent = "primary" }: ToolkitSectionProps) {
	const categoryTools = getToolsByCategory(category);
	if (categoryTools.length === 0) return null;

	const isInfo = accent === "info";

	return (
		<section className={cn("border-b border-border", muted && "bg-muted/40")}>
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					{eyebrow && <SectionEyebrow index={eyebrow.index} label={eyebrow.label} />}
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
					<p className="mt-2 text-muted-foreground">{subtitle}</p>
				</div>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-2">
					{categoryTools.map(tool =>
						tool.available ? (
							<Link
								key={tool.slug}
								href={tool.href}
								className={cn(
									"inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 font-mono text-xs font-medium transition-colors",
									isInfo
										? "border-info/40 bg-info/10 text-info hover:bg-info/20"
										: "border-primary/40 bg-primary/10 text-primary-accent hover:bg-primary/20",
								)}
							>
								{tool.name}
								<ArrowRight className="size-3.5" />
							</Link>
						) : (
							<span
								key={tool.slug}
								className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-3.5 py-2 font-mono text-xs font-medium text-subtle-foreground"
							>
								{tool.name}
							</span>
						),
					)}
				</div>

				<div className="mt-8 text-center">
					<Link href={`/category/${category}`} className={cn("text-sm font-medium hover:underline", isInfo ? "text-info" : "text-primary")}>
						{exploreLabel} →
					</Link>
				</div>
			</div>
		</section>
	);
}
