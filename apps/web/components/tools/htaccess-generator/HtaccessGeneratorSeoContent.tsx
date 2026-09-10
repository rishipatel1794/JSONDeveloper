import Link from "next/link";

const SECTIONS = [
	{
		title: "What is .htaccess?",
		body: "A .htaccess file is a per-directory configuration file read by the Apache web server. It lets you change server behavior — redirects, caching, compression, access rules, security headers — without editing the server's main configuration, which is why it's the standard way to configure sites on shared hosting where you don't have access to httpd.conf.",
	},
	{
		title: "How to use a generated .htaccess file",
		body: "Configure the options above, copy or download the result, and place it in your site's root directory (or a subdirectory, if you only want the rules to apply there) as a file literally named .htaccess. Apache's mod_rewrite, mod_headers, mod_deflate, and mod_expires modules need to be enabled on your server for the relevant sections to take effect — most shared hosts enable them by default.",
	},
	{
		title: "Common .htaccess use cases",
		body: "Forcing HTTPS so visitors are never served the site over plain HTTP, redirecting www to a non-www domain (or vice versa) to avoid duplicate-content SEO issues, disabling directory listing so folders without an index file don't expose their contents, and adding cache headers so browsers don't re-download unchanged images and scripts on every visit.",
	},
	{
		title: "Why the CSP header is off by default",
		body: "A Content-Security-Policy header can break a site instantly if its value doesn't match what the page actually loads — scripts, fonts, and images from an unlisted origin will simply be blocked. This tool leaves it disabled unless you explicitly turn it on and provide a value, and shows a warning to test thoroughly before deploying it.",
	},
];

export function HtaccessGeneratorSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding .htaccess configuration</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Deploying to Nginx instead of Apache? Nginx doesn&apos;t read .htaccess files at all — use the{" "}
					<Link href="/tools/nginx-config-generator" className="text-primary hover:underline">
						Nginx Config Generator
					</Link>{" "}
					to get the equivalent server block configuration.
				</p>
			</div>
		</section>
	);
}
