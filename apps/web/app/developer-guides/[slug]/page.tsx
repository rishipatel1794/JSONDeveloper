import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { createPageMetadata } from "@/lib/seo";
import { DEVELOPER_GUIDES, getDeveloperGuide } from "@/lib/content/guides";
import { formatContentDate } from "@/lib/content/format-date";

export const dynamicParams = false;

export function generateStaticParams() {
	return DEVELOPER_GUIDES.map(guide => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const guide = getDeveloperGuide(slug);
	if (!guide) return {};

	return createPageMetadata({
		title: `${guide.title} - Developer Guides`,
		description: guide.description,
		path: `/developer-guides/${guide.slug}`,
	});
}

export default async function DeveloperGuidePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const guide = getDeveloperGuide(slug);
	if (!guide) notFound();

	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<Link href="/developer-guides" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
					<ArrowLeft className="size-3.5" />
					Back to Developer Guides
				</Link>

				<div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
					<span>Updated {formatContentDate(guide.updatedAt)}</span>
					<span aria-hidden="true">·</span>
					<span>{guide.readingTime}</span>
				</div>

				<h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{guide.title}</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">{guide.description}</p>

				<div className="mt-8 space-y-8">
					{guide.sections.map(section => (
						<div key={section.title}>
							<h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<Link
					href={guide.relatedTool.href}
					className="mt-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary"
				>
					<span className="text-sm font-medium text-foreground">{guide.relatedTool.label}</span>
					<ArrowRight className="size-4 text-muted-foreground" />
				</Link>
			</div>
		</main>
	);
}
