import { Accordion } from "@/components/ui/Accordion";

import type { CodegenTarget } from "./JsonToCodeTool";
import { TARGET_INFO } from "./targetInfo";

interface JsonCodegenFaqProps {
	target: CodegenTarget;
}

export function getFaqItems(target: CodegenTarget) {
	const { label, outputName } = TARGET_INFO[target];

	return [
		{
			question: `How do I convert JSON to ${label}?`,
			answer: `Paste a JSON sample into the input above — the ${outputName} is generated automatically as you type. Copy it or download it as a file.`,
		},
		{
			question: `Does this generate nested ${outputName}s for nested objects?`,
			answer: `Yes. Every nested object in the JSON gets its own named ${outputName}, and arrays are typed based on what they contain, so deeply nested data stays fully typed instead of collapsing into a generic type.`,
		},
		{
			question: "What happens if a field is null in my sample JSON?",
			answer: "A null value is typed as null in the generated output. If that field can also hold a real value in other cases, edit your sample JSON to include an example with a non-null value so the type is inferred correctly.",
		},
		{
			question: "Is this tool free, and is my JSON uploaded?",
			answer: "Yes, it's free with no sign-up, and the conversion runs entirely in your browser — your JSON is never sent to a server.",
		},
		{
			question: "Can I rename the generated root type?",
			answer: "Yes — use the root name field above the editors to set the name used for the top-level generated type; nested types are named after their parent property.",
		},
	];
}

export function JsonCodegenFaq({ target }: JsonCodegenFaqProps) {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>

				<div className="mt-8">
					<Accordion items={getFaqItems(target)} />
				</div>
			</div>
		</section>
	);
}
