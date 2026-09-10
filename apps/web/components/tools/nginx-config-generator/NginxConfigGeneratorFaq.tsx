import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "Why does the generator never write \"ssl on;\"?",
		answer: "That directive was removed in Nginx 1.25 and is deprecated before that — modern configs enable TLS per-listen-directive instead, with listen 443 ssl;. This tool always uses the current, supported syntax.",
	},
	{
		question: "Do I need two server blocks for HTTPS?",
		answer: "If you want HTTP requests to redirect to HTTPS (recommended), yes — one small block on port 80 that only redirects, and the main block on port 443 with your certificate paths. If you don't need the redirect, a single HTTPS-only block is enough.",
	},
	{
		question: "What's the difference between proxy_pass and root?",
		answer: "proxy_pass forwards the request to another running process (your backend), while root serves files directly from disk. A config uses one or the other for a given location block, not both — that's why this tool switches the whole location block based on the mode you pick.",
	},
	{
		question: "How do I test the config before reloading Nginx?",
		answer: "Run sudo nginx -t. It checks the syntax of every config file Nginx would load and reports the first error it finds, without affecting the currently running server — always do this before nginx -s reload.",
	},
];

export function NginxConfigGeneratorFaq() {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>

				<div className="mt-8">
					<Accordion items={FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
