import { productConfig } from "@repo/config";

export function SeoContent() {
	return (
		<section className="border-b border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16 sm:py-20">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
					Developer tools for everyday development
				</h2>

				<div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
					<p>
						{productConfig.name} is a growing collection of fast, browser-based utilities built for the tasks developers
						run into every day. Instead of installing another CLI or juggling scattered bookmarklets, you get a single
						workspace for the small, repetitive jobs that add up over a project: formatting JSON, decoding a token,
						testing a regular expression, or tidying up a SQL query.
					</p>

					<p>
						The <strong className="text-foreground">JSON tools</strong> handle formatting, validation, minifying, and
						converting JSON into TypeScript, Zod, Python, PHP, or Java. The <strong className="text-foreground">API
						tools</strong> cover JWTs, cURL commands, and response inspection. <strong className="text-foreground">Regex</strong>{" "}
						and <strong className="text-foreground">SQL</strong> tools help you test and explain patterns and queries
						without leaving the browser, and the <strong className="text-foreground">web</strong> and{" "}
						<strong className="text-foreground">DevOps</strong> utilities round out everyday tasks like encoding,
						formatting, and config generation.
					</p>

					<p>
						Tools that support local processing run entirely in your browser, so there&apos;s no server round-trip
						slowing you down. The interface stays consistent across every tool — the same layout, the same keyboard
						shortcuts, the same copy and download actions — so once you&apos;ve used one, you already know how to use
						the rest.
					</p>
				</div>
			</div>
		</section>
	);
}
