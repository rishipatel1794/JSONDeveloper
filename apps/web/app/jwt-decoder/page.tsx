import type { Metadata } from "next";
import { KeyRound } from "lucide-react";

import { JwtDecoder } from "@/components/tools/jwt-decoder/JwtDecoder";
import { JwtFaq } from "@/components/tools/jwt-decoder/JwtFaq";
import { JwtSeoContent } from "@/components/tools/jwt-decoder/JwtSeoContent";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata: Metadata = {
	title: "JWT Decoder — Decode JSON Web Tokens Online",
	description:
		"Decode and inspect JWT headers, payloads, claims, and signatures directly in your browser. Fast, free, and privacy-friendly.",
};

export default function JwtDecoderPage() {
	return (
		<main>
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={KeyRound}
					title="JWT Decoder"
					description="Decode and inspect JSON Web Tokens directly in your browser."
				/>

				<JwtDecoder />
			</div>

			<JwtSeoContent />
			<JwtFaq />
		</main>
	);
}
