import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createPageMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { ToolCard } from "@/components/home/ToolCard";
import { categories, getCategory, getToolsByCategory, type CategorySlug } from "@/lib/tools/registry";

export const dynamicParams = false;

export function generateStaticParams() {
	return categories.map(category => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const category = getCategory(slug as CategorySlug);
	if (!category) return {};

	return createPageMetadata({
		title: `${category.name} Tools`,
		description: `${category.description} Browse every ${category.name} tool on JSONDeveloper.`,
		path: `/category/${category.slug}`,
	});
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const category = getCategory(slug as CategorySlug);
	if (!category) notFound();

	const tools = getToolsByCategory(category.slug);

	return (
		<main className="container mx-auto max-w-7xl px-4 py-10">
			<ToolPageHeader icon={category.icon} title={`${category.name} Tools`} description={category.description} />

			{tools.length === 0 ? (
				<p className="text-sm text-muted-foreground">No tools in this category yet — check back soon.</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{tools.map(tool => (
						<ToolCard key={tool.slug} tool={tool} />
					))}
				</div>
			)}
		</main>
	);
}
