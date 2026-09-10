import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BLOG_POSTS } from "@/lib/content/blog";
import { formatContentDate } from "@/lib/content/format-date";

export function DeveloperGuidesSection() {
	const latestPosts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4);
	if (latestPosts.length === 0) return null;

	return (
		<section className="border-b border-border bg-muted/40">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Learn and build faster</h2>
					<p className="mt-2 text-muted-foreground">Practical guides for everyday development problems.</p>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{latestPosts.map(post => (
						<Link
							key={post.slug}
							href={`/blog/${post.slug}`}
							className="rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated"
						>
							<time dateTime={post.publishedAt} className="text-xs text-muted-foreground">
								{formatContentDate(post.publishedAt)}
							</time>
							<h3 className="mt-1.5 text-sm font-semibold text-foreground">{post.title}</h3>
							<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.description}</p>
						</Link>
					))}
				</div>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
					<Link href="/developer-guides" className="inline-flex items-center gap-1 text-primary hover:underline">
						View all guides <ArrowRight className="size-3.5" />
					</Link>
					<Link href="/blog" className="inline-flex items-center gap-1 text-primary hover:underline">
						View blog <ArrowRight className="size-3.5" />
					</Link>
				</div>
			</div>
		</section>
	);
}
