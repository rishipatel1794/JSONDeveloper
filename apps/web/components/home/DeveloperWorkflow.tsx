import { ArrowRight, Clipboard, Cog, Rocket, Send } from "lucide-react";

const STEPS = [
	{ icon: Clipboard, title: "Paste", description: "Paste your JSON, token, or query." },
	{ icon: Cog, title: "Process", description: "Format, validate, or convert instantly." },
	{ icon: Send, title: "Copy", description: "Copy or download the result." },
	{ icon: Rocket, title: "Ship", description: "Use it in your application." },
];

export function DeveloperWorkflow() {
	return (
		<section className="border-b border-border">
			<div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Built into your workflow</h2>
					<p className="mt-2 text-muted-foreground">From input to shipped code in four steps.</p>
				</div>

				<ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{STEPS.map((step, index) => (
						<li key={step.title} className="relative rounded-lg border border-border bg-card p-5">
							<span className="font-mono text-xs text-subtle-foreground">0{index + 1}</span>

							<span className="mt-2 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
								<step.icon className="size-5" />
							</span>

							<h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
							<p className="mt-1 text-sm text-muted-foreground">{step.description}</p>

							{index < STEPS.length - 1 && (
								<ArrowRight className="absolute -right-2.5 top-1/2 hidden size-4 -translate-y-1/2 text-subtle-foreground lg:block" />
							)}
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
