import { FileText } from "lucide-react";

import { productConfig } from "@repo/config";

import { createPageMetadata } from "@/lib/seo";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

const CONTACT_EMAIL = "rishipatel1794@gmail.com";
const LAST_UPDATED = "August 31, 2026";

export const metadata = createPageMetadata({
	title: `Terms of Service - ${productConfig.name}`,
	description: `The terms for using ${productConfig.name}'s free developer tools.`,
	path: "/terms",
});

const SECTIONS = [
	{
		title: "Using this site",
		body: `${productConfig.name} provides a set of free developer tools for formatting, validating, converting, and inspecting data. By using this site, you agree to use it only for lawful purposes and not to attempt to disrupt, overload, or gain unauthorized access to it or the systems behind it.`,
	},
	{
		title: "No account, no warranty",
		body: "These tools are provided \"as is\", free of charge, with no account required. They're built and maintained on a best-effort basis, without any warranty of accuracy, availability, or fitness for a particular purpose. Always verify critical output — especially anything you're about to run in production — before relying on it.",
	},
	{
		title: "Your content",
		body: "You retain all rights to whatever you paste, upload, or type into these tools. As described in the Privacy Policy, that content is processed in your browser and isn't collected or stored by this site.",
	},
	{
		title: "The API Client",
		body: "The API Client sends HTTP requests to destinations you specify, through a proxy that only exists to make the network call on your behalf. You're responsible for having the right to make those requests and for complying with the terms of any API or service you access through it.",
	},
	{
		title: "Limitation of liability",
		body: `To the fullest extent permitted by law, ${productConfig.name} and its maintainer are not liable for any damages or losses arising from your use of, or inability to use, this site or its tools.`,
	},
	{
		title: "Changes to these terms",
		body: "These terms may be updated from time to time. Continued use of the site after a change means you accept the revised terms.",
	},
	{
		title: "Questions",
		body: `If you have any questions about these terms, email ${CONTACT_EMAIL}.`,
	},
];

export default function TermsPage() {
	return (
		<main>
			<div className="container mx-auto max-w-3xl px-4 py-10">
				<ToolPageHeader icon={FileText} title="Terms of Service" description={`Last updated ${LAST_UPDATED}.`} />

				<div className="space-y-8">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
