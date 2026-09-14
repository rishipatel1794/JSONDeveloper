import Link from "next/link";

import type { CodegenTarget } from "./JsonToCodeTool";
import { TARGET_INFO } from "./targetInfo";

interface JsonCodegenSeoContentProps {
	target: CodegenTarget;
}

export function JsonCodegenSeoContent({ target }: JsonCodegenSeoContentProps) {
	const { label, outputName } = TARGET_INFO[target];

	const sections = [
		{
			title: `Why generate ${label} ${outputName}s from JSON?`,
			body: `Writing ${label} types by hand for an API response or config file is repetitive and easy to get subtly wrong — a missed optional field, a mismatched type, or a typo in a key name. Generating the ${outputName} directly from a real JSON sample keeps the shape accurate and saves the manual transcription.`,
		},
		{
			title: `How this converter infers types`,
			body: `Each JSON value's runtime type maps to the closest matching ${label} type — strings, numbers, and booleans map directly, arrays become typed lists, and nested objects become their own nested ${outputName}s so deeply nested data stays readable instead of collapsing into a single generic type.`,
		},
		{
			title: "How to use it",
			body: `Paste a representative JSON sample into the input above — ideally one with every field populated, since fields the converter never sees can't be inferred. The generated ${outputName} appears on the right; copy it or download it as a file.`,
		},
		{
			title: "Does this handle nested objects and arrays?",
			body: `Yes. Nested objects each get their own named ${outputName}, and arrays are typed based on their element type — an array of objects produces an array of the corresponding nested ${outputName}, not a generic untyped list.`,
		},
		{
			title: "Is my JSON uploaded anywhere?",
			body: "No — the conversion runs entirely in your browser. Your JSON sample and the generated code never leave your device.",
		},
	];

	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding JSON to {label}</h2>

				<div className="mt-6 space-y-6">
					{sections.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Need a different language? This converter is also available for{" "}
					{Object.entries(TARGET_INFO)
						.filter(([key]) => key !== target)
						.map(([key, info], index, array) => (
							<span key={key}>
								{index > 0 && (index === array.length - 1 ? ", and " : ", ")}
								<Link href={info.path} className="text-primary hover:underline">
									{info.label}
								</Link>
							</span>
						))}
					.
				</p>
			</div>
		</section>
	);
}
