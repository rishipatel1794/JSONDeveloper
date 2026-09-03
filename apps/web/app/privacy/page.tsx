import { Shield } from "lucide-react";

import { productConfig } from "@repo/config";

import { createPageMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

const CONTACT_EMAIL = "rishipatel1794@gmail.com";
const LAST_UPDATED = "August 31, 2026";

export const metadata = createPageMetadata({
	title: `Privacy Policy - ${productConfig.name}`,
	description: `How ${productConfig.name} handles your data. Short version: it doesn't leave your browser.`,
	path: "/privacy",
});

const SECTIONS = [
	{
		title: "The short version",
		body: "Every tool on this site — the JSON formatter, code diff, regex tester, timestamp converter, JWT decoder, and the rest — runs entirely as JavaScript in your own browser. Whatever you paste, upload, or type into them is processed on your device and is never uploaded to a server, logged, or stored remotely.",
	},
	{
		title: "The API Client is the one exception",
		body: "Browsers can't send arbitrary cross-origin HTTP requests directly (CORS), so the API Client relays the request you build through a small proxy server purely to make the outbound network call and return the response to you. The proxy does not log request or response bodies, headers, or URLs — it exists only to forward traffic, not to inspect or retain it.",
	},
	{
		title: "What's stored on your device",
		body: "Some tools save small amounts of data locally in your browser, using localStorage or IndexedDB, so your work survives a page refresh — for example, the API Client's saved requests, or the Timestamp Converter's recent history. This data lives only in your browser, is never transmitted anywhere, and can be cleared at any time from your browser's site settings.",
	},
	{
		title: "Cookies and analytics",
		body: "This site does not use cookies, and it does not run any third-party analytics, advertising, or tracking scripts. Your usage of these tools isn't monitored.",
	},
	{
		title: "Server logs",
		body: "Like any web server, the hosting infrastructure may generate standard, short-lived technical logs (e.g. IP address and timestamp) for security and abuse prevention. These are operational logs, not analytics, and are not used to identify individual users or their activity.",
	},
	{
		title: "Changes to this policy",
		body: "If this policy changes, the update will be reflected on this page with a new date below. Continued use of the site after a change means you accept the revised policy.",
	},
	{
		title: "Questions",
		body: `If you have any questions about this policy, email ${CONTACT_EMAIL}.`,
	},
];

export default function PrivacyPage() {
	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<ToolPageHeader icon={Shield} title="Privacy Policy" description={`Last updated ${LAST_UPDATED}.`} />

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
