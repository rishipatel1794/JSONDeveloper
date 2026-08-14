"use client";

import { useState } from "react";
import Link from "next/link";
import { Braces, Menu, X } from "lucide-react";

import { productConfig } from "@repo/config";

import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
	{ label: "Tools", href: "/#popular-tools" },
	{ label: "Categories", href: "/#categories" },
	{ label: "Docs", href: "/#faq" },
];

export function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
			<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
					<span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
						<Braces className="size-5" />
					</span>
					{productConfig.name}
				</Link>

				<nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
					{NAV_LINKS.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-1">
					{productConfig.githubUrl && (
						<a
							href={productConfig.githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`${productConfig.name} on GitHub`}
							className="hidden size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
						>
							<GitHubIcon className="size-4" />
						</a>
					)}

					<ThemeToggle />

					<button
						type="button"
						onClick={() => setIsMenuOpen(open => !open)}
						aria-expanded={isMenuOpen}
						aria-controls="mobile-nav"
						aria-label={isMenuOpen ? "Close menu" : "Open menu"}
						className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
					>
						{isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
					</button>
				</div>
			</div>

			{isMenuOpen && (
				<nav id="mobile-nav" aria-label="Primary" className="border-t border-border px-4 py-2 md:hidden">
					{NAV_LINKS.map(link => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setIsMenuOpen(false)}
							className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
						>
							{link.label}
						</Link>
					))}

					{productConfig.githubUrl && (
						<a
							href={productConfig.githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
						>
							GitHub
						</a>
					)}
				</nav>
			)}
		</header>
	);
}
