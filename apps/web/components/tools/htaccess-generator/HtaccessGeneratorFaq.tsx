import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "Why isn't my .htaccess file working?",
		answer: "The most common cause is that mod_rewrite (or mod_headers/mod_deflate/mod_expires, for the relevant sections) isn't enabled on your server, or AllowOverride is set to None in the main Apache config for that directory. Contact your host or check your server's httpd.conf if directives seem to be ignored entirely.",
	},
	{
		question: "Will this lock me out of my own site?",
		answer: "No — this generator deliberately avoids destructive or overly broad directives. It doesn't generate rules that deny all access, restrictive IP allow-lists, or blanket file blocks, and the CSP header is off by default specifically because it's the one option that can break a working site if misconfigured.",
	},
	{
		question: "Can I have multiple .htaccess files?",
		answer: "Yes — Apache reads a .htaccess file in every directory as it walks down to the requested file, applying each one. A .htaccess in a subdirectory can add to or override rules from a parent directory's .htaccess.",
	},
	{
		question: "Does gzip or brotli compression need anything on the client side?",
		answer: "No — browsers automatically request compressed content via the Accept-Encoding header and decompress the response transparently. These directives only affect what the server sends, not anything the visitor's browser needs to configure.",
	},
];

export function HtaccessGeneratorFaq() {
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
