import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What is cURL?",
		answer:
			"cURL is a command-line tool for making HTTP requests. A cURL command describes an entire request — method, URL, headers, body — in one line you can run in a terminal.",
	},
	{
		question: "How do I create a cURL request?",
		answer:
			"Choose a method and enter a URL, then use the Query, Headers, Body, and Auth tabs to add whatever the request needs. The command on the right updates as you go.",
	},
	{
		question: "Can I generate a POST request?",
		answer: "Yes — every method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) is supported, along with a request body for POST/PUT/PATCH.",
	},
	{
		question: "Can I add Authorization headers?",
		answer:
			"Yes, either manually in the Headers tab or through the Auth tab, which supports Bearer tokens, Basic auth, and API keys (as a header or query parameter).",
	},
	{
		question: "Can I import an existing cURL command?",
		answer:
			"Yes — switch to Import cURL, paste a command, and it parses the method, URL, query parameters, headers, body, and recognizable authentication back into the builder.",
	},
	{
		question: "Does this tool execute my API request?",
		answer: "No. This tool only generates and parses cURL commands. It never executes the request.",
	},
	{
		question: "Is my API key sent to the server?",
		answer:
			"No. Your request configuration — including tokens, passwords, and cookies — is processed entirely in your browser and never sent to our backend.",
	},
];

export function CurlFaq() {
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
