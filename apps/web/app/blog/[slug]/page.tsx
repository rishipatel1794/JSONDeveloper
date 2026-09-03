import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { createPageMetadata } from "@/lib/seo";
import { BLOG_POSTS, getBlogPost } from "@/lib/content/blog";
import { formatContentDate } from "@/lib/content/format-date";

export const dynamicParams = false;

export function generateStaticParams() {
	return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const post = getBlogPost(slug);
	if (!post) return {};

	return createPageMetadata({
		title: `${post.title} - Blog`,
		description: post.description,
		path: `/blog/${post.slug}`,
	});
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const post = getBlogPost(slug);
	if (!post) notFound();

	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
					<ArrowLeft className="size-3.5" />
					Back to Blog
				</Link>

				<div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
					<time dateTime={post.publishedAt}>{formatContentDate(post.publishedAt)}</time>
					<span aria-hidden="true">·</span>
					<span>{post.readingTime}</span>
				</div>

				<h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{post.title}</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">{post.description}</p>

				<div className="mt-8 space-y-8">
					{post.sections.map(section => (
						<div key={section.title}>
							<h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<Link
					href={post.relatedTool.href}
					className="mt-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary"
				>
					<span className="text-sm font-medium text-foreground">{post.relatedTool.label}</span>
					<ArrowRight className="size-4 text-muted-foreground" />
				</Link>
			</div>
		</main>
	);
}
