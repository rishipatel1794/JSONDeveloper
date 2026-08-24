"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="container mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
			<div className="flex size-14 items-center justify-center rounded-lg bg-destructive-muted text-destructive">
				<AlertTriangle className="size-7" />
			</div>

			<h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Something went wrong</h1>
			<p className="mt-3 text-sm text-muted-foreground sm:text-base">
				An unexpected error occurred while rendering this page. Your data was not sent anywhere — every tool here runs locally in your browser.
			</p>

			<div className="mt-6 flex flex-wrap justify-center gap-2">
				<Button onClick={reset}>Try again</Button>
				<Button href="/" variant="outline">
					Go to homepage
				</Button>
			</div>
		</main>
	);
}
