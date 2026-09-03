import { Newspaper } from "lucide-react";
import Link from "next/link";

import { productConfig } from "@repo/config";

import { createPageMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { BLOG_POSTS } from "@/lib/content/blog";
import { formatContentDate } from "@/lib/content/format-date";

export const metadata = createPageMetadata({
	title: `Blog - ${productConfig.name}`,
	description: `Short, practical write-ups on JSON, JWTs, regex, timestamps, and the other things ${productConfig.name}'s tools deal with every day.`,
	path: "/blog",
});

export default function BlogIndexPage() {
	const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<ToolPageHeader icon={Newspaper} title="Blog" description="Short, practical write-ups on the things these tools deal with every day." />

				<div className="space-y-4">
					{posts.map(post => (
						<Link
							key={post.slug}
							href={`/blog/${post.slug}`}
							className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary"
						>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<time dateTime={post.publishedAt}>{formatContentDate(post.publishedAt)}</time>
								<span aria-hidden="true">·</span>
								<span>{post.readingTime}</span>
							</div>
							<h2 className="mt-1.5 text-base font-semibold text-foreground">{post.title}</h2>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
