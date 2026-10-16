export type InferenceConfidence = "high" | "low";

export interface InferenceResult {
	pattern: string;
	confidence: InferenceConfidence;
	notes: string[];
}

function escapeRegExpLiteral(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeForCharClass(value: string): string {
	return value.replace(/[\]\\^-]/g, "\\$&");
}

/** Builds the narrowest common character class for a set of characters seen at the same position. */
function classifyPosition(chars: Set<string>): string {
	if (chars.size === 1) {
		return escapeRegExpLiteral([...chars][0]!);
	}

	const all = [...chars];
	if (all.every(ch => /\d/.test(ch))) return "\\d";
	if (all.every(ch => /[A-Z]/.test(ch))) return "[A-Z]";
	if (all.every(ch => /[a-z]/.test(ch))) return "[a-z]";
	if (all.every(ch => /[A-Za-z]/.test(ch))) return "[A-Za-z]";
	if (all.every(ch => /[A-Za-z0-9]/.test(ch))) return "[A-Za-z0-9]";

	return `[${escapeForCharClass(all.sort().join(""))}]`;
}

function literalAlternation(examples: string[]): string {
	return `^(?:${examples.map(escapeRegExpLiteral).join("|")})$`;
}

/**
 * Infers a "reasonable candidate" regex from example strings — never presented as a guaranteed
 * representation of the user's actual intended rule, only as a starting point to edit further.
 */
export function inferPatternFromExamples(positiveExamples: string[], negativeExamples: string[] = []): InferenceResult {
	const notes: string[] = [];
	const examples = positiveExamples.map(example => example.trim()).filter(Boolean);

	if (examples.length === 0) {
		return { pattern: "", confidence: "low", notes: ["Enter at least one example that should match."] };
	}

	const lengths = new Set(examples.map(example => example.length));

	if (lengths.size === 1 && examples.length >= 2) {
		const length = [...lengths][0]!;
		const positions: string[] = [];

		for (let i = 0; i < length; i++) {
			const charsHere = new Set(examples.map(example => example[i]!));
			positions.push(classifyPosition(charsHere));
		}

		const candidate = `^${positions.join("")}$`;

		let candidateRegex: RegExp;
		try {
			candidateRegex = new RegExp(candidate);
		} catch {
			return fallbackToLiteral(examples, notes.concat("Could not build a generalized pattern from these examples — falling back to an exact list."));
		}

		const falsePositives = negativeExamples.filter(example => candidateRegex.test(example));
		if (falsePositives.length > 0) {
			return fallbackToLiteral(
				examples,
				notes.concat(
					`A generalized pattern based on character position also matched examples you said should NOT match (${falsePositives.join(", ")}) — falling back to an exact list of only the given examples instead.`,
				),
			);
		}

		notes.push(
			"This pattern was generalized from the position of each character across your examples (same character everywhere → literal; otherwise the narrowest matching class: digits, uppercase, lowercase, or letters). It has not been verified against any input beyond what you provided.",
		);
		if (examples.length < 3) {
			notes.push("Only a couple of examples were given — more examples (especially ones that vary in realistic ways) would make this inference more reliable.");
		}

		return { pattern: candidate, confidence: "high", notes };
	}

	notes.push(
		"Your examples don't all share the same length, so a reliable per-character pattern can't be inferred. This fallback matches exactly the examples you gave — edit it by hand to generalize further.",
	);
	return fallbackToLiteral(examples, notes);
}

function fallbackToLiteral(examples: string[], notes: string[]): InferenceResult {
	return { pattern: literalAlternation(examples), confidence: "low", notes };
}
