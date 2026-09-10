import Link from "next/link";

const SECTIONS = [
	{
		title: "What is an Nginx server block?",
		body: "A server block is Nginx's equivalent of an Apache virtual host — a self-contained set of directives that defines how Nginx handles requests for a given domain and port, whether that's serving static files, reverse-proxying to an application server, or both.",
	},
	{
		title: "Reverse proxy vs static site",
		body: "In reverse-proxy mode, Nginx forwards incoming requests to a backend process (a Node.js/Next.js/Express app, for example) running on a local port, which is the standard way to put Nginx in front of any app server for TLS termination, caching, and load balancing. In static mode, Nginx serves files directly from a root directory with no backend process involved at all.",
	},
	{
		title: "How to deploy a generated config",
		body: "Save the output as a file under /etc/nginx/sites-available/ (Debian/Ubuntu convention), symlink it into /etc/nginx/sites-enabled/, then test the config with nginx -t before reloading with systemctl reload nginx or nginx -s reload. Testing first means a typo won't take your existing sites down.",
	},
	{
		title: "Why the proxy headers matter",
		body: "Without Host, X-Real-IP, X-Forwarded-For, and X-Forwarded-Proto, your backend application only sees requests as if they all came from Nginx itself on localhost — logs would show the wrong client IP, and the app couldn't tell whether the original request was HTTP or HTTPS. Most frameworks (Express, Next.js) read these headers automatically once they're set.",
	},
];

export function NginxConfigGeneratorSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding Nginx server blocks</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Running on Apache instead? Use the{" "}
					<Link href="/tools/htaccess-generator" className="text-primary hover:underline">
						.htaccess Generator
					</Link>{" "}
					for the equivalent Apache configuration.
				</p>
			</div>
		</section>
	);
}
