"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { inferPatternFromExamples } from "@/lib/tools/regex-generator/exampleInference";

interface ExamplesModeProps {
	onApply: (pattern: string) => void;
}

const textareaClass =
	"w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ExamplesMode({ onApply }: ExamplesModeProps) {
	const [positiveText, setPositiveText] = useState("");
	const [negativeText, setNegativeText] = useState("");
	const [notes, setNotes] = useState<string[]>([]);
	const [confidence, setConfidence] = useState<"high" | "low" | null>(null);

	function generate() {
		const positives = positiveText.split("\n").filter(line => line.trim() !== "");
		const negatives = negativeText.split("\n").filter(line => line.trim() !== "");
		const result = inferPatternFromExamples(positives, negatives);
		setNotes(result.notes);
		setConfidence(result.pattern ? result.confidence : null);
		onApply(result.pattern);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Strings that SHOULD match (one per line)</label>
					<textarea value={positiveText} onChange={event => setPositiveText(event.target.value)} rows={6} placeholder={"AB123\nXY789"} className={textareaClass} />
				</div>
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Strings that should NOT match (optional, one per line)</label>
					<textarea value={negativeText} onChange={event => setNegativeText(event.target.value)} rows={6} placeholder={"123AB"} className={textareaClass} />
				</div>
			</div>

			<Button onClick={generate} variant="primary" size="sm">
				Generate from examples
			</Button>

			{confidence && (
				<ToolAlert variant={confidence === "high" ? "info" : "warning"} title={confidence === "high" ? "Generalized from your examples" : "Low confidence — exact match only"}>
					<ul className="list-inside list-disc space-y-0.5">
						{notes.map(note => (
							<li key={note}>{note}</li>
						))}
					</ul>
				</ToolAlert>
			)}
		</div>
	);
}
