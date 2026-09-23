import { ScanText } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { FAQ_ITEMS, OcrToJsonFaq } from "@/components/tools/ocr-json/OcrToJsonFaq";
import { OcrToJson } from "@/components/tools/ocr-json/OcrToJson";
import { OcrToJsonSeoContent } from "@/components/tools/ocr-json/OcrToJsonSeoContent";

const TITLE = "OCR to JSON Converter - Structure OCR Output Online";
const DESCRIPTION =
	"Convert an OCR or document-parsing response (PaddleOCR and similar) into structured JSON — extracts label/value pairs from OCR'd text, entirely in your browser.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/tools/ocr-to-json",
	keywords: ["ocr to json", "paddleocr json", "ocr response converter", "document parsing to json"],
});

const jsonLd = getToolJsonLd({ name: "OCR to JSON Converter", description: DESCRIPTION, path: "/tools/ocr-to-json" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function OcrToJsonPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={ScanText}
					title="OCR to JSON Converter"
					description="Convert an OCR/document-parsing response into structured JSON, entirely in your browser."
				/>

				<OcrToJson />
			</ToolPageContainer>

			<OcrToJsonSeoContent />
			<OcrToJsonFaq />
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "JSON Validator", href: "/json-validator", description: "Validate JSON and debug syntax errors." },
					{ name: "JSON to TypeScript", href: "/tools/json-to-typescript", description: "Generate TypeScript interfaces from JSON." },
				]}
			/>
		</main>
	);
}
