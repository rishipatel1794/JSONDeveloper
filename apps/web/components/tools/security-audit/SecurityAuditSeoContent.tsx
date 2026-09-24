const SECTIONS = [
	{
		title: "What is a website security audit?",
		body: "A security audit like this one checks the publicly observable parts of how a website is configured — its HTTP response headers, HTTPS/TLS availability, cookie attributes, Content Security Policy, and CORS settings — and compares them against widely-recommended defensive practices. It's a passive, read-only check: nothing is exploited, guessed, or brute-forced.",
	},
	{
		title: "What security headers should a website have?",
		body: "There's no single required set, but the most commonly recommended ones are Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options (or a CSP frame-ancestors directive), and Referrer-Policy. Which ones actually matter — and how strict they should be — depends heavily on what the site does.",
	},
	{
		title: "What is CSP?",
		body: "Content-Security-Policy is a header that tells the browser which sources a page is allowed to load scripts, styles, images, fonts, and other resources from. A well-configured CSP significantly raises the bar for cross-site scripting and some data-injection attacks, since injected code that violates the policy simply won't run.",
	},
	{
		title: "What is HSTS?",
		body: "Strict-Transport-Security tells a browser to only ever connect to this domain over HTTPS for a set period of time, even if a link or typed address uses http://. This closes a window that a network attacker could otherwise use to downgrade a visitor to an unencrypted connection.",
	},
	{
		title: "What is HttpOnly?",
		body: "HttpOnly is a cookie attribute that prevents JavaScript running on the page from reading that cookie's value. It doesn't stop the cookie from being sent with requests — it just keeps it out of reach of client-side script, which matters most for session cookies in case the site ever has an XSS issue.",
	},
	{
		title: "What is SameSite?",
		body: "SameSite is a cookie attribute that controls whether a cookie is sent along with requests that originate from a different site (e.g. clicking a link from another domain, or that domain's page making a request to this one). It's one of the main defenses against CSRF attacks.",
	},
	{
		title: "How can I improve my website's security?",
		body: "Start with what this tool actually flags as HIGH or CRITICAL — those tend to be the highest-impact, lowest-effort fixes (enabling HTTPS, adding HSTS, fixing insecure cookie attributes). From there, work through MEDIUM findings like a missing CSP, then treat LOW/INFO items as incremental hardening rather than urgent fixes.",
	},
];

export function SecurityAuditSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding website security audits</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
