import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Accordion } from "@/components/ui/Accordion";
import { createPageMetadata, getFaqJsonLd } from "@/lib/seo";
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
		keywords: post.keywords,
	});
}

function slugifyHeading(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const post = getBlogPost(slug);
	if (!post) notFound();

	const faqJsonLd = post.faq && post.faq.length > 0 ? getFaqJsonLd(post.faq) : null;

	return (
		<main>
			{faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

			<article className="container mx-auto max-w-3xl px-4 py-10">
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

				{post.showTableOfContents && (
					<nav aria-label="Table of contents" className="mt-6 rounded-xl border border-border bg-card p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">On this page</p>
						<ol className="mt-2 space-y-1 text-sm">
							{post.sections.map(section => (
								<li key={section.title}>
									<a href={`#${slugifyHeading(section.title)}`} className="text-primary hover:underline">
										{section.title}
									</a>
								</li>
							))}
							{post.faq && post.faq.length > 0 && (
								<li>
									<a href="#faq" className="text-primary hover:underline">
										FAQ
									</a>
								</li>
							)}
						</ol>
					</nav>
				)}

				<div className="mt-8 space-y-8">
					{post.sections.map(section => (
						<section key={section.title} id={slugifyHeading(section.title)} className="scroll-mt-16">
							<h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>

							{section.list && (
								<ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
									{section.list.map(item => (
										<li key={item}>{item}</li>
									))}
								</ul>
							)}

							{section.codeBlock && (
								<pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-secondary p-3 font-mono text-xs leading-relaxed text-foreground">
									<code>{section.codeBlock.code}</code>
								</pre>
							)}

							{section.table && (
								<div className="mt-3 overflow-x-auto rounded-lg border border-border">
									<table className="w-full text-left text-sm">
										<thead>
											<tr className="border-b border-border bg-secondary">
												{section.table.headers.map(header => (
													<th key={header} className="px-3 py-2 font-semibold text-foreground">
														{header}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{section.table.rows.map(row => (
												<tr key={row.join("|")} className="border-b border-border-subtle last:border-b-0">
													{row.map((cell, index) => (
														<td key={index} className="px-3 py-2 align-top text-muted-foreground">
															{cell}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}

							{section.links && section.links.length > 0 && (
								<p className="mt-2 text-sm text-muted-foreground">
									{section.links.map((link, index) => (
										<span key={link.href}>
											{index > 0 && " · "}
											<Link href={link.href} className="text-primary hover:underline">
												{link.label}
											</Link>
										</span>
									))}
								</p>
							)}
						</section>
					))}
				</div>

				{post.faq && post.faq.length > 0 && (
					<section id="faq" className="mt-10 scroll-mt-16 border-t border-border pt-8">
						<h2 className="text-xl font-bold tracking-tight text-foreground">Frequently asked questions</h2>
						<div className="mt-4">
							<Accordion items={post.faq} />
						</div>
					</section>
				)}

				<Link
					href={post.relatedTool.href}
					className="mt-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary"
				>
					<span className="text-sm font-medium text-foreground">{post.relatedTool.label}</span>
					<ArrowRight className="size-4 text-muted-foreground" />
				</Link>
			</article>
		</main>
	);
}
