import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What is an API client?",
		answer:
			"A tool for building and sending HTTP requests — method, URL, headers, body, and authentication — and inspecting the response, without writing code.",
	},
	{
		question: "Can I test GET and POST requests?",
		answer: "Yes — GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS are all supported, along with a request body for methods that use one.",
	},
	{
		question: "Can I add authentication headers?",
		answer:
			"Yes, through the Authorization tab (Bearer Token, Basic Auth, or API Key) or by adding headers manually in the Headers tab.",
	},
	{
		question: "Can I send JSON requests?",
		answer: "Yes — the Body tab's JSON option gives you a Monaco-based editor with a Format JSON button.",
	},
	{
		question: "Does this API client execute requests?",
		answer:
			"Yes. Unlike our other tools, this one actually sends the request you configure — through our server proxy, not directly from your browser. That's what lets it reach APIs that block direct browser requests.",
	},
	{
		question: "Are my API credentials stored?",
		answer:
			"No. Your request configuration, including tokens and passwords, is held only in your browser's memory for the current session and is not written to a database or persisted anywhere. It is, however, sent to our proxy server to execute the request — see the privacy notice above the request builder.",
	},
	{
		question: "Why can't I access some local/private APIs?",
		answer:
			"In production, the proxy blocks requests to private and internal network addresses (like localhost, 127.0.0.1, or 192.168.x.x) as a security measure — without it, the proxy could be used to probe internal infrastructure it shouldn't be able to reach. Local development environments allow this so you can test against your own machine.",
	},
];

export function ApiFaq() {
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
