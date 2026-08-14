import { ArrowRight, FileJson2, Laptop, MonitorSmartphone, Sparkles } from "lucide-react";

const FLOW = [
	{ icon: FileJson2, label: "Your data" },
	{ icon: MonitorSmartphone, label: "Your browser" },
	{ icon: Laptop, label: "Tool" },
	{ icon: Sparkles, label: "Result" },
];

export function PrivacySection() {
	return (
		<section className="border-b border-border bg-muted/40">
			<div className="container mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your data stays in your browser</h2>

					<p className="mt-4 text-muted-foreground">
						Many of our tools process data locally, meaning your JSON, tokens, and text don&apos;t need to leave your
						device. Tools that support local processing run directly in your browser — there&apos;s nothing to upload and
						nothing to wait on.
					</p>
				</div>

				<div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 sm:flex-row sm:justify-between">
					{FLOW.map((step, index) => (
						<div key={step.label} className="flex items-center gap-3 sm:flex-col sm:gap-2">
							<div className="flex flex-col items-center gap-2 sm:flex-row">
								<span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
									<step.icon className="size-5" />
								</span>
								<span className="text-sm font-medium text-foreground">{step.label}</span>
							</div>

							{index < FLOW.length - 1 && (
								<ArrowRight className="size-4 shrink-0 rotate-90 text-subtle-foreground sm:rotate-0" />
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
