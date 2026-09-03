import { BookOpen } from "lucide-react";
import Link from "next/link";

import { productConfig } from "@repo/config";

import { createPageMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { DEVELOPER_GUIDES } from "@/lib/content/guides";
import { formatContentDate } from "@/lib/content/format-date";

export const metadata = createPageMetadata({
	title: `Developer Guides - ${productConfig.name}`,
	description: `Practical, tool-by-tool guides for getting the most out of ${productConfig.name}.`,
	path: "/developer-guides",
});

export default function DeveloperGuidesIndexPage() {
	const guides = [...DEVELOPER_GUIDES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<ToolPageHeader icon={BookOpen} title="Developer Guides" description="Practical, tool-by-tool guides for getting the most out of these tools." />

				<div className="space-y-4">
					{guides.map(guide => (
						<Link
							key={guide.slug}
							href={`/developer-guides/${guide.slug}`}
							className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary"
						>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>Updated {formatContentDate(guide.updatedAt)}</span>
								<span aria-hidden="true">·</span>
								<span>{guide.readingTime}</span>
							</div>
							<h2 className="mt-1.5 text-base font-semibold text-foreground">{guide.title}</h2>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{guide.description}</p>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
