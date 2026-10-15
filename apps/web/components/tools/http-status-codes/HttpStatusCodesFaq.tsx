import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "What's the difference between 401 and 403?",
		answer:
			"401 Unauthorized means the server doesn't know who you are — authentication is missing or invalid. 403 Forbidden means the server does know who you are, but you don't have permission to do this. Re-authenticating fixes a 401; it won't fix a 403.",
	},
	{
		question: "Should I return 400 or 422 for a validation error?",
		answer:
			"400 Bad Request is for a structurally malformed request — invalid JSON, wrong content type, missing required syntax. 422 Unprocessable Content is for a well-formed request that fails validation or business rules, like an invalid email format or a value out of range.",
	},
	{
		question: "Should a create endpoint return 200 or 201?",
		answer: "201 Created, when a POST successfully creates a new resource. Use 200 OK for requests that succeed without creating something new, and 202 Accepted when the creation is queued for asynchronous processing rather than completed immediately.",
	},
	{
		question: "What's the difference between 301 and 302?",
		answer:
			"301 Moved Permanently tells clients and search engines the resource has permanently moved — update your records. 302 Found is a temporary redirect — keep using the original URL next time. If the HTTP method must be preserved exactly, use 308 or 307 instead.",
	},
	{
		question: "What's the difference between 502 and 504?",
		answer: "502 Bad Gateway means a proxy or gateway got a response from the upstream server, but it was invalid. 504 Gateway Timeout means the upstream server never responded in time at all.",
	},
	{
		question: "Is 418 I'm a Teapot a real status code?",
		answer:
			"It originated as an April Fools' joke in RFC 2324 and was later marked obsolete by RFC 7168. Some servers implement it as an Easter egg, but it isn't a mandatory internet standard the way 404 or 500 are.",
	},
];

export function HttpStatusCodesFaq() {
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
