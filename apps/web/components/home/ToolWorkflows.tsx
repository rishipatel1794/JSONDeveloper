import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getToolBySlug } from "@/lib/tools/registry";

import { SectionEyebrow } from "./SectionEyebrow";

const WORKFLOWS = [
	{ title: "Work with JSON", slugs: ["json-formatter", "json-validator", "json-to-typescript", "json-to-zod"] },
	{ title: "Debug an API", slugs: ["api-client", "jwt-decoder", "curl-generator", "json-formatter"] },
	{ title: "Work with code", slugs: ["code-diff", "regex-tester", "sql-formatter"] },
	{ title: "DevOps configuration", slugs: ["cron-generator", "cron-parser", "nginx-config-generator", "docker-compose-generator"] },
];

export function ToolWorkflows() {
	const workflows = WORKFLOWS.map(workflow => ({
		title: workflow.title,
		// Only ever link to tools that actually exist and are live — never a placeholder or dead link.
		tools: workflow.slugs.map(slug => getToolBySlug(slug)).filter(tool => tool?.available),
	})).filter(workflow => workflow.tools.length >= 2);

	if (workflows.length === 0) return null;

	return (
		<section className="border-b border-border bg-muted/40">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					<SectionEyebrow index={3} label="WORKFLOWS" />
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Developer workflows</h2>
					<p className="mt-2 text-muted-foreground">Tools that work together, not just tools in a list.</p>
				</div>

				<div className="mt-10 grid gap-4 lg:grid-cols-2">
					{workflows.map(workflow => (
						<div key={workflow.title} className="rounded-lg border border-border bg-card p-5">
							<h3 className="text-sm font-semibold text-foreground">{workflow.title}</h3>

							<div className="mt-3 flex flex-wrap items-center gap-2">
								{workflow.tools.map((tool, index) => (
									<div key={tool!.slug} className="flex items-center gap-2">
										<Link
											href={tool!.href}
											className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary-accent"
										>
											{tool!.name}
										</Link>
										{index < workflow.tools.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden="true" />}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
