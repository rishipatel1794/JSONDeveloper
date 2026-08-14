import { Gift, ShieldCheck, Terminal, Zap } from "lucide-react";

const FEATURES = [
	{
		icon: Zap,
		title: "Fast",
		description: "Tools run instantly with minimal processing overhead.",
	},
	{
		icon: ShieldCheck,
		title: "Privacy friendly",
		description: "Tools that support local processing run directly in your browser.",
	},
	{
		icon: Gift,
		title: "Free",
		description: "Core developer utilities remain free to use.",
	},
	{
		icon: Terminal,
		title: "Built for developers",
		description: "Keyboard shortcuts, clean interfaces, and copy/download actions.",
	},
];

export function WhyDevelopers() {
	return (
		<section className="border-b border-border">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Why developers use us</h2>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map(feature => (
						<div key={feature.title} className="rounded-lg border border-border bg-card p-5">
							<span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
								<feature.icon className="size-5" />
							</span>

							<h3 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h3>
							<p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
