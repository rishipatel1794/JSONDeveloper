import type { Metadata } from "next";

import { absoluteUrl, createPageMetadata, siteName } from "@/lib/seo";

import { CTA } from "@/components/home/CTA";
import { DeveloperGuidesSection } from "@/components/home/DeveloperGuidesSection";
import { FAQ, HOMEPAGE_FAQ_ITEMS } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { PopularTools } from "@/components/home/PopularTools";
import { PrivacySection } from "@/components/home/PrivacySection";
import { RecentlyAdded } from "@/components/home/RecentlyAdded";
import { SeoContent } from "@/components/home/SeoContent";
import { ToolCategories } from "@/components/home/ToolCategories";
import { ToolkitSection } from "@/components/home/ToolkitSection";
import { ToolWorkflows } from "@/components/home/ToolWorkflows";
import { WhyDevelopers } from "@/components/home/WhyDevelopers";

const TITLE = `${siteName} | Free Online Developer Tools`;
const DESCRIPTION =
	"Fast and free online developer tools for JSON, APIs, regex, SQL, web development, and DevOps. Format, validate, convert, generate, and debug without complicated setup.";

export const metadata: Metadata = createPageMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/",
	keywords: ["online developer tools", "free developer tools", "json tools", "api tools", "devops tools"],
});

export default function Home() {
	const webpageJsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: TITLE,
		description: DESCRIPTION,
		url: absoluteUrl("/"),
	};

	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: HOMEPAGE_FAQ_ITEMS.map(item => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: item.answer,
			},
		})),
	};

	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageJsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<Hero />
			<PopularTools />
			<ToolCategories />
			<ToolWorkflows />
			<RecentlyAdded />
			<ToolkitSection
				category="json"
				title="JSON developer toolkit"
				subtitle="Format, validate, minify, and convert JSON without leaving your browser."
				exploreLabel="Explore all JSON tools"
				eyebrow={{ index: 4, label: "JSON TOOLKIT" }}
			/>
			<ToolkitSection
				category="devops"
				title="DevOps tools"
				subtitle="Generate configuration files and schedules faster."
				exploreLabel="Explore all DevOps tools"
				muted
				accent="info"
			/>
			<PrivacySection />
			<WhyDevelopers />
			<DeveloperGuidesSection />
			<SeoContent />
			<FAQ />
			<CTA />
		</main>
	);
}
