import type { Metadata } from "next";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
	title: "Page not found",
	description: "This page doesn't exist.",
};

export default function NotFound() {
	return (
		<main className="container mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
			<div className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
				<Compass className="size-7" />
			</div>

			<h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
			<p className="mt-3 text-sm text-muted-foreground sm:text-base">
				This page does not exist or may have moved. Check the URL, or head back and pick a tool from the list.
			</p>

			<div className="mt-6 flex flex-wrap justify-center gap-2">
				<Button href="/">Go to homepage</Button>
				<Button href="/#popular-tools" variant="outline">
					Browse tools
				</Button>
			</div>
		</main>
	);
}
