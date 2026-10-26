import Link from "next/link";
import { CheckCircle2, Download, Puzzle, ShieldCheck } from "lucide-react";

import { productConfig } from "@repo/config";

import { createPageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata = createPageMetadata({
	title: "Chrome Extension",
	description: "Install the JSONDeveloper Chrome extension to automatically format JSON API responses in your browser tabs, and hand them off to the JSONDeveloper editor with one click.",
	path: "/extension",
});

const FEATURES = [
	{
		title: "Automatic JSON formatting",
		body: "Navigate directly to a URL that returns raw JSON — an API endpoint, a .json file — and the extension replaces Chrome's plain-text view with a syntax-highlighted, collapsible tree. Raw and formatted views are both one click away.",
	},
	{
		title: "One-click editor hand-off",
		body: `Click "Open in ${productConfig.name}" from any detected JSON page to send it straight to the Visualizer — no copy-pasting. The transfer never touches the URL or your browsing history.`,
	},
	{
		title: "Format copied JSON instantly",
		body: "Copy any JSON text, open the extension popup, and click \"Format copied JSON\" to pretty-print it back onto your clipboard without opening a tab at all.",
	},
];

const PERMISSIONS = [
	{ name: "storage", reason: "Remembers your auto-format and theme preferences, and briefly holds a JSON payload while it's handed off to the editor." },
	{ name: "activeTab", reason: "Lets the popup act on the page you're currently viewing without requesting access to every open tab." },
	{ name: `Host access to ${productConfig.url.replace(/^https?:\/\//, "")}`, reason: "Only this site can receive a JSON hand-off from the extension — no other website is granted any access." },
];

export default function ExtensionPage() {
	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<ToolPageHeader icon={Puzzle} title="Chrome Extension" description="Format JSON responses directly in your browser tabs, and send them to the editor in one click." />

				<div className="flex flex-wrap gap-3">
					<Button href="https://github.com/rishipatel1794/JSONDeveloper/tree/main/extension" target="_blank" rel="noopener noreferrer">
						<Download className="size-4" />
						Get the source on GitHub
					</Button>
					<Button href="/visualizer" variant="outline">
						Try the JSON Visualizer instead
					</Button>
				</div>

				<p className="mt-3 text-xs text-subtle-foreground">
					Not yet listed on the Chrome Web Store — install it as an unpacked extension for now (instructions below). A store listing is in progress.
				</p>

				<div className="mt-10 space-y-8">
					{FEATURES.map(feature => (
						<div key={feature.title}>
							<h2 className="text-lg font-semibold text-foreground">{feature.title}</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
						</div>
					))}
				</div>

				<div className="mt-10 rounded-xl border border-border bg-card p-5">
					<h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
						<ShieldCheck className="size-4 text-primary" />
						Privacy and permissions
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						The extension never reads your browsing history, never transmits page content to any server, and only acts on a page when that page is itself
						a raw JSON document. Here&apos;s exactly what each requested permission is for:
					</p>
					<ul className="mt-3 space-y-2 text-sm">
						{PERMISSIONS.map(permission => (
							<li key={permission.name} className="flex gap-2">
								<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
								<span>
									<code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground">{permission.name}</code>{" "}
									<span className="text-muted-foreground">— {permission.reason}</span>
								</span>
							</li>
						))}
					</ul>
				</div>

				<div className="mt-10">
					<h2 className="text-lg font-semibold text-foreground">Install it now (load unpacked)</h2>
					<ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
						<li>
							Download or clone the repository and locate the <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground">/extension</code>{" "}
							folder.
						</li>
						<li>
							Open <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground">chrome://extensions</code> in Chrome.
						</li>
						<li>
							Turn on <strong className="text-foreground">Developer mode</strong> (top-right toggle).
						</li>
						<li>
							Click <strong className="text-foreground">Load unpacked</strong> and select the <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground">/extension</code> folder.
						</li>
						<li>Visit any URL that returns raw JSON (e.g. a public API endpoint) to see it in action.</li>
					</ol>
				</div>

				<p className="mt-10 text-sm text-muted-foreground">
					Looking for the browser-based tool instead? The{" "}
					<Link href="/visualizer" className="text-primary hover:underline">
						JSON Visualizer
					</Link>{" "}
					works the same way, without installing anything.
				</p>
			</div>
		</main>
	);
}
