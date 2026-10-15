import { KeyRound } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { JwtGenerator } from "@/components/tools/jwt-generator/JwtGenerator";
import { FAQ_ITEMS, JwtGeneratorFaq } from "@/components/tools/jwt-generator/JwtGeneratorFaq";
import { JwtGeneratorSeoContent } from "@/components/tools/jwt-generator/JwtGeneratorSeoContent";

const TITLE = "JWT Generator Online - Create JSON Web Tokens";
const DESCRIPTION = "Generate JSON Web Tokens online using HS256 and other supported algorithms. Configure JWT claims, expiration, issuer and audience, and inspect the generated token.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/jwt-generator",
	keywords: [
		"jwt generator",
		"create jwt online",
		"generate json web token",
		"sign jwt online",
		"jwt generator hs256",
		"jwt builder",
	],
});

const jsonLd = getToolJsonLd({ name: "JWT Generator", description: DESCRIPTION, path: "/jwt-generator" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function JwtGeneratorPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={KeyRound}
					title="JWT Generator"
					description="Build and sign a JSON Web Token — HS256 through EdDSA — entirely in your browser."
				/>

				<JwtGenerator />
			</ToolPageContainer>

			<JwtGeneratorSeoContent />
			<JwtGeneratorFaq />
			<RelatedTools
				tools={[
					{ name: "JWT Decoder", href: "/jwt-decoder", description: "Decode and inspect JSON Web Tokens locally." },
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
					{ name: "HTTP Status Code Reference", href: "/http-status-codes", description: "Look up what every HTTP status code means." },
					{ name: "API Response Formatter", href: "/api-response-formatter", description: "Format, validate, and analyze API JSON responses." },
				]}
			/>
		</main>
	);
}
