import Link from "next/link";
import { Braces } from "lucide-react";

import { productConfig } from "@repo/config";

import { GitHubIcon } from "@/components/icons/GitHubIcon";

interface FooterLink {
	label: string;
	href?: string;
}

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
	{
		title: "Product",
		links: [
			{ label: "Tools", href: "/#popular-tools" },
			{ label: "Categories", href: "/#categories" },
			{ label: "JSON Formatter", href: "/json-formatter" },
			{ label: "Documentation", href: "/#faq" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Blog", href: "/blog" },
			{ label: "Developer Guides", href: "/developer-guides" },
			{ label: "FAQ", href: "/#faq" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Contact", href: "/contact" },
			{ label: "Privacy", href: "/privacy" },
			{ label: "Terms", href: "/terms" },
		],
	},
];

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-muted">
			<div className="container mx-auto max-w-7xl px-4 py-12">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
					<div className="lg:col-span-2">
						<Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
							<span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
								<Braces className="size-5" />
							</span>
							{productConfig.name}
						</Link>

						<p className="mt-3 max-w-xs text-sm text-muted-foreground">{productConfig.description}</p>

						{productConfig.githubUrl && (
							<a
								href={productConfig.githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${productConfig.name} on GitHub`}
								className="mt-4 inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
							>
								<GitHubIcon className="size-4" />
							</a>
						)}
					</div>

					{FOOTER_COLUMNS.map(column => (
						<div key={column.title}>
							<h3 className="text-sm font-semibold text-foreground">{column.title}</h3>

							<ul className="mt-3 space-y-2.5">
								{column.links.map(link => (
									<li key={link.label}>
										{link.href ? (
											<Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
												{link.label}
											</Link>
										) : (
											<span className="inline-flex items-center gap-1.5 text-sm text-subtle-foreground">
												{link.label}
												<span className="rounded-full border border-border-subtle px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
													Soon
												</span>
											</span>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-10 border-t border-border-subtle pt-6 text-sm text-subtle-foreground">
					© {year} {productConfig.name}. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
