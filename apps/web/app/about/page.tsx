import { Info } from "lucide-react";

import { productConfig } from "@repo/config";

import { createPageMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata = createPageMetadata({
	title: `About - ${productConfig.name}`,
	description: `Learn what ${productConfig.name} is, how it works, and why every tool runs entirely in your browser.`,
	path: "/about",
});

const SECTIONS = [
	{
		title: "What is JSONDeveloper?",
		body: "JSONDeveloper is a free collection of developer tools — a JSON formatter and validator, an API client, a code diff viewer, a regex tester, a SQL formatter, a JWT decoder, a timestamp converter, and more. Every tool is built to open instantly and work without an account, a subscription, or an installation.",
	},
	{
		title: "Everything runs in your browser",
		body: "Formatting JSON, comparing code, decoding a token, testing a regex — all of it runs as JavaScript in your own browser tab. Your input isn't uploaded to a server just to be processed, which means it works offline once loaded and never has to leave your machine to do its job.",
	},
	{
		title: "The one exception: the API Client",
		body: "Sending a live HTTP request is the one thing a browser can't fully do on its own because of CORS, so the API Client relays your outgoing request through a small proxy purely to make the network call and return the response — it doesn't log, store, or inspect what you send.",
	},
	{
		title: "Why it's free",
		body: "JSONDeveloper is a side project, built and maintained by one developer who uses these tools daily and got tired of ad-heavy alternatives. There's no premium tier and no plan to add one — just tools that stay fast and out of your way.",
	},
];

export default function AboutPage() {
	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<ToolPageHeader icon={Info} title="About" description={`The story behind ${productConfig.name}.`} />

				<div className="space-y-8">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
