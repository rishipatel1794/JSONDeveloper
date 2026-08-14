import { productConfig } from "@repo/config";

import { Button } from "@/components/ui/Button";

import { ToolSearch } from "./ToolSearch";

export function Hero() {
	return (
		<section className="relative overflow-hidden border-b border-border">
			<div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

			<div className="container relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
					Developer tools.
					<br />
					Built for developers.
				</h1>

				<p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
					{productConfig.description}. Fast, free, and privacy-friendly utilities for JSON, APIs, SQL, regex, web development,
					and DevOps — no setup, no complicated workflows.
				</p>

				<div className="mt-8">
					<ToolSearch />
				</div>

				<div className="mt-8">
					<Button href="#popular-tools" size="lg">
						Explore Tools
					</Button>
				</div>
			</div>
		</section>
	);
}
