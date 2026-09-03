import { Mail } from "lucide-react";

import { productConfig } from "@repo/config";

import { createPageMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { GitHubIcon } from "@/components/icons/GitHubIcon";

const CONTACT_EMAIL = "rishipatel1794@gmail.com";

export const metadata = createPageMetadata({
	title: `Contact - ${productConfig.name}`,
	description: `Get in touch with the ${productConfig.name} team — report a bug, request a tool, or ask a question.`,
	path: "/contact",
});

export default function ContactPage() {
	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<ToolPageHeader icon={Mail} title="Contact" description="Found a bug, have a feature request, or just want to say hi?" />

				<div className="space-y-6">
					<p className="text-sm leading-relaxed text-muted-foreground">
						{productConfig.name} is maintained by a single developer, so the fastest way to reach me is directly by email. I read every
						message — bug reports, tool requests, and general feedback are all welcome.
					</p>

					<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Mail className="size-5" />
							</span>
							<div>
								<div className="text-sm font-medium text-foreground">Email</div>
								<a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-primary hover:underline">
									{CONTACT_EMAIL}
								</a>
							</div>
						</div>
					</div>

					{productConfig.githubUrl && (
						<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<GitHubIcon className="size-4" />
								</span>
								<div>
									<div className="text-sm font-medium text-foreground">GitHub</div>
									<a href={productConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
										Open an issue
									</a>
								</div>
							</div>
						</div>
					)}

					<p className="text-sm leading-relaxed text-muted-foreground">
						When reporting a bug, it helps to include which tool you were using and the steps to reproduce it. Please don&apos;t send API
						keys, passwords, or other secrets by email — none of that is ever needed to help.
					</p>
				</div>
			</div>
		</main>
	);
}
