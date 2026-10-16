import type { AST } from "@eslint-community/regexpp";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

function numberWord(n: number): string {
	return NUMBER_WORDS[n] ?? String(n);
}

function characterClassUnit(node: AST.CharacterClass): string {
	if (node.elements.length === 1 && node.elements[0]!.type === "CharacterClassRange") {
		const range = node.elements[0]!;
		const min = String.fromCodePoint(range.min.value);
		const max = String.fromCodePoint(range.max.value);
		if (min === "A" && max === "Z") return "uppercase ASCII letter";
		if (min === "a" && max === "z") return "lowercase ASCII letter";
		if (min === "0" && max === "9") return "digit";
	}
	const negated = "negate" in node && node.negate;
	return `character ${negated ? "not " : ""}from the set [${node.raw.slice(1, -1).replace(/^\^/, "")}]`;
}

function characterSetUnit(node: AST.CharacterSet): string {
	if (node.kind === "any") return "character";
	if (node.kind === "digit") return node.negate ? "non-digit character" : "digit";
	if (node.kind === "space") return node.negate ? "non-whitespace character" : "whitespace character";
	if (node.kind === "word") return node.negate ? "non-word character" : "word character";
	return `character matching ${node.raw}`;
}

/** A short noun-phrase for one quantifiable element, used as the unit a quantifier count attaches to. */
function unitPhrase(node: AST.QuantifiableElement): string {
	switch (node.type) {
		case "Character":
			return `the character "${String.fromCodePoint(node.value)}"`;
		case "CharacterSet":
			return characterSetUnit(node);
		case "CharacterClass":
			return characterClassUnit(node);
		case "Backreference":
			return typeof node.ref === "number" ? `a repeat of whatever group #${node.ref} matched` : `a repeat of whatever "${node.ref}" matched`;
		case "CapturingGroup":
		case "Group":
			return `(${phraseForAlternatives(node.alternatives)})`;
		default:
			return "a match for this pattern";
	}
}

function quantityPrefix(min: number, max: number): { prefix: string; plural: boolean } {
	if (min === 0 && max === 1) return { prefix: "an optional", plural: false };
	if (min === 0 && max === Infinity) return { prefix: "zero or more", plural: true };
	if (min === 1 && max === Infinity) return { prefix: "one or more", plural: true };
	if (min === max) return { prefix: `exactly ${numberWord(min)}`, plural: min !== 1 };
	if (max === Infinity) return { prefix: `${numberWord(min)} or more`, plural: true };
	return { prefix: `between ${numberWord(min)} and ${numberWord(max)}`, plural: true };
}

function pluralize(unit: string): string {
	// Only pluralize a simple trailing noun — good enough for the short units this ever receives.
	if (unit.endsWith("y") && !/[aeiou]y$/.test(unit)) return `${unit.slice(0, -1)}ies`;
	if (/(s|x|ch)$/.test(unit)) return `${unit}es`;
	return `${unit}s`;
}

function phraseForElement(element: AST.Element): string {
	if (element.type === "Quantifier") {
		const unit = unitPhrase(element.element);
		const { prefix, plural } = quantityPrefix(element.min, element.max);
		const lazy = element.greedy ? "" : " (as few as possible)";
		return `${prefix} ${plural ? pluralize(unit) : unit}${lazy}`;
	}

	if (element.type === "Assertion") {
		if (element.kind === "start") return "the start of the input";
		if (element.kind === "end") return "the end of the input";
		if (element.kind === "word") return element.negate ? "a non-word-boundary position" : "a word boundary";
		if (element.kind === "lookahead") return `${element.negate ? "not " : ""}followed by ${phraseForAlternatives(element.alternatives)} (without consuming it)`;
		const lookbehind = element as AST.LookbehindAssertion;
		return `${lookbehind.negate ? "not " : ""}preceded by ${phraseForAlternatives(lookbehind.alternatives)} (without consuming it)`;
	}

	return unitPhrase(element);
}

function phraseForAlternative(alternative: AST.Alternative): string {
	if (alternative.elements.length === 0) return "an empty string";
	return alternative.elements.map(phraseForElement).join(", followed by ");
}

function phraseForAlternatives(alternatives: AST.Alternative[]): string {
	if (alternatives.length === 1) return phraseForAlternative(alternatives[0]!);
	return alternatives.map(phraseForAlternative).join(", OR ");
}

/**
 * A concise, best-effort plain-English summary of what the pattern actually enforces. It describes
 * only what's structurally present — it never claims a format is validated beyond what the pattern
 * itself checks (e.g. it won't say "a valid date" for a pattern that only checks digit positions).
 */
export function describePatternInPlainEnglish(pattern: AST.Pattern): string {
	const body = phraseForAlternatives(pattern.alternatives);
	const hasStartAnchor = pattern.alternatives.every(alt => alt.elements[0]?.type === "Assertion" && alt.elements[0].kind === "start");
	const hasEndAnchor = pattern.alternatives.every(alt => {
		const last = alt.elements[alt.elements.length - 1];
		return last?.type === "Assertion" && last.kind === "end";
	});

	const anchorNote = hasStartAnchor && hasEndAnchor ? " The pattern is anchored to both the start and end of the input, so the entire string must match — not just part of it." : hasStartAnchor ? " The pattern is anchored to the start of the input." : hasEndAnchor ? " The pattern is anchored to the end of the input." : " The pattern is not anchored, so it can match as a substring anywhere in the input.";

	return `This pattern matches ${body}.${anchorNote}`;
}
