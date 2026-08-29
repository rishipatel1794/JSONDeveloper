import type { Metadata } from "next";

import { absoluteUrl, createPageMetadata, siteDescription, siteName } from "@/lib/seo";

import { CTA } from "@/components/home/CTA";
import { DeveloperWorkflow } from "@/components/home/DeveloperWorkflow";
import { FAQ } from "@/components/home/FAQ";
import { FeaturedTools } from "@/components/home/FeaturedTools";
import { Hero } from "@/components/home/Hero";
import { PopularTools } from "@/components/home/PopularTools";
import { PrivacySection } from "@/components/home/PrivacySection";
import { SeoContent } from "@/components/home/SeoContent";
import { ToolCategories } from "@/components/home/ToolCategories";
import { WhyDevelopers } from "@/components/home/WhyDevelopers";

export const metadata: Metadata = createPageMetadata({
	title: `${siteName} | Online Developer Tools`,
	description: siteDescription,
	path: "/",
	keywords: ["browser-based tools", "developer productivity", "privacy-friendly tools"],
});

export default function Home() {
	const webpageJsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: `${siteName} | Online Developer Tools`,
		description: siteDescription,
		url: absoluteUrl("/"),
	};

	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: [
			{
				"@type": "Question",
				name: "Are these developer tools free?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Yes. The core developer tools are free to use with no account required.",
				},
			},
			{
				"@type": "Question",
				name: "Do I need to install anything?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "No installation is needed. Every tool runs directly in your browser.",
				},
			},
			{
				"@type": "Question",
				name: "Is my data uploaded?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Many tools support local processing in your browser, reducing the need to send data to a server.",
				},
			},
		],
	};

	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageJsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
			<Hero />
			<PopularTools />
			<ToolCategories />
			<WhyDevelopers />
			<FeaturedTools />
			<DeveloperWorkflow />
			<PrivacySection />
			<SeoContent />
			<FAQ />
			<CTA />
		</main>
	);
}
