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

export default function Home() {
	return (
		<main>
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
