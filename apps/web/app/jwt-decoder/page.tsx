import { Suspense } from "react";
import { KeyRound } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { FAQ_ITEMS, JwtFaq } from "@/components/tools/jwt-decoder/JwtFaq";
import { JwtDecoder } from "@/components/tools/jwt-decoder/JwtDecoder";
import { JwtSeoContent } from "@/components/tools/jwt-decoder/JwtSeoContent";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

const TITLE = "JWT Decoder — Decode JSON Web Tokens Online";
const DESCRIPTION = "Decode and inspect JWT headers, payloads, claims, and signatures directly in your browser. Fast, free, and privacy-friendly.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/jwt-decoder",
	keywords: ["jwt decoder", "json web token", "jwt payload parser"],
});

const jsonLd = getToolJsonLd({ name: "JWT Decoder", description: DESCRIPTION, path: "/jwt-decoder" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function JwtDecoderPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={KeyRound}
					title="JWT Decoder"
					description="Decode and inspect JSON Web Tokens directly in your browser."
				/>

				<Suspense fallback={null}>
					<JwtDecoder />
				</Suspense>
			</ToolPageContainer>

			<JwtSeoContent />
			<JwtFaq />
			<RelatedTools
				tools={[
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
					{ name: "cURL Generator", href: "/curl-generator", description: "Build and generate cURL commands for HTTP requests." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "Timestamp Converter", href: "/timestamp-converter", description: "Convert and inspect Unix timestamps and dates." },
				]}
			/>
		</main>
	);
}
