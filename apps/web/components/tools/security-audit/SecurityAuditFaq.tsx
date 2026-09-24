import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "Is this an official security certification?",
		answer:
			"No. The JSONDeveloper Security Score reflects only the specific checks this tool performs — it is not a Google, OWASP, Mozilla, or industry-certified rating, and shouldn't be treated as a complete security assessment.",
	},
	{
		question: "Does this tool try to hack or exploit my website?",
		answer:
			"No. It only performs safe, passive, read-only checks — inspecting response headers, cookies, HTTPS availability, and the fetched HTML for things like mixed content. It never attempts exploitation, brute forcing, injection testing, or any state-changing request.",
	},
	{
		question: "Can I audit any website?",
		answer:
			"You can audit any publicly accessible website. Requests to localhost, private/internal IP addresses, and cloud metadata endpoints are blocked — this tool is for auditing public sites, not internal infrastructure.",
	},
	{
		question: "Do you store my audit results?",
		answer: "No. Reports aren't stored — the audit runs, you see the result, and that's it. Download the report yourself if you want to keep it.",
	},
	{
		question: "Why is a missing header not always marked as critical?",
		answer:
			"Context matters. A missing Content-Security-Policy is flagged more seriously than a missing Permissions-Policy, for example, because CSP tends to have a much larger real-world security impact. This tool tries to reflect that instead of treating every missing header the same way.",
	},
	{
		question: "Why can't this tool show me my TLS certificate details?",
		answer: "This tool's backend runs in an environment that doesn't expose the underlying TLS connection, so certificate subject/issuer/expiration aren't available here rather than being guessed at. Use your browser's certificate viewer for those details.",
	},
];

export function SecurityAuditFaq() {
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
