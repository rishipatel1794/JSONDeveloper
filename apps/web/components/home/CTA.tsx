import { Button } from "@/components/ui/Button";

export function CTA() {
	return (
		<section>
			<div className="container mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
					Build faster. Debug faster. Ship faster.
				</h2>

				<p className="mt-3 text-muted-foreground">Explore the developer tools you need — no setup required.</p>

				<div className="mt-6">
					<Button href="#popular-tools" size="lg">
						Explore All Tools
					</Button>
				</div>
			</div>
		</section>
	);
}
