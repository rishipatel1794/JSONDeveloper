import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "What OCR tools does this work with?",
		answer:
			"It's built primarily around PaddleOCR's document-parsing output (a \"markdown\" field containing OCR'd text in reading order), but it also accepts raw OCR'd text pasted with no wrapping JSON at all, so other OCR tools with similar text-block output work too.",
	},
	{
		question: "Why is a field's value empty in the output?",
		answer: "An empty value means the label was found in the OCR response but no recognized text appeared before the next label started — this reflects what OCR actually returned, not something the tool failed to parse.",
	},
	{
		question: "What is the \"unlabeled\" array in the output?",
		answer: "It holds text the tool couldn't confidently pair with a label — document titles, and fragments that ended up out of order due to how the OCR engine read the page layout. Nothing is discarded silently.",
	},
	{
		question: "Does this tool perform OCR on an image or PDF?",
		answer: "No. It converts an OCR response you already have into structured JSON — it doesn't extract text from images or PDFs itself.",
	},
	{
		question: "Is this free, and is my data uploaded?",
		answer: "Yes, it's free with no sign-up, and everything runs locally in your browser — your OCR response and the resulting JSON are never sent to a server.",
	},
];

export function OcrToJsonFaq() {
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
