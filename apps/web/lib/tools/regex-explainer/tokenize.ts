import type { AST } from "@eslint-community/regexpp";

import { describeAssertion, describeQuantifiable, describeQuantifier } from "./describeNode";

export interface TokenRow {
	raw: string;
	type: string;
	meaning: string;
	matches: string;
	depth: number;
}

/** The literal text before the first alternative starts — "(", "(?:", "(?<name>", "(?=", "(?<!", etc. */
function openingDelimiter(node: { raw: string; start: number }, firstAlternative: AST.Alternative): string {
	return node.raw.slice(0, firstAlternative.start - node.start);
}

function walkAlternatives(alternatives: AST.Alternative[], depth: number, rows: TokenRow[]): void {
	alternatives.forEach((alternative, index) => {
		if (index > 0) {
			rows.push({ raw: "|", type: "Alternation", meaning: "OR — matches whichever branch (before or after this) succeeds", matches: "—", depth });
		}
		for (const element of alternative.elements) {
			walkElement(element, depth, rows);
		}
	});
}

function walkElement(element: AST.Element, depth: number, rows: TokenRow[]): void {
	if (element.type === "Quantifier") {
		walkQuantifier(element, depth, rows);
		return;
	}

	if (element.type === "Group" || element.type === "CapturingGroup") {
		const desc = describeQuantifiable(element);
		rows.push({ raw: openingDelimiter(element, element.alternatives[0]!), type: desc.type, meaning: desc.meaning, matches: desc.matches, depth });
		walkAlternatives(element.alternatives, depth + 1, rows);
		return;
	}

	if (element.type === "Assertion" && (element.kind === "lookahead" || element.kind === "lookbehind")) {
		const desc = describeAssertion(element);
		rows.push({ raw: openingDelimiter(element, element.alternatives[0]!), type: desc.type, meaning: desc.meaning, matches: desc.matches, depth });
		walkAlternatives(element.alternatives, depth + 1, rows);
		return;
	}

	if (element.type === "Assertion") {
		const desc = describeAssertion(element);
		rows.push({ raw: element.raw, type: desc.type, meaning: desc.meaning, matches: desc.matches, depth });
		return;
	}

	const desc = describeQuantifiable(element);
	rows.push({ raw: element.raw, type: desc.type, meaning: desc.meaning, matches: desc.matches, depth });
}

function walkQuantifier(node: AST.Quantifier, depth: number, rows: TokenRow[]): void {
	const inner = node.element;
	const innerDesc = describeQuantifiable(inner);
	const quantity = describeQuantifier(node.min, node.max, node.greedy);

	if (inner.type === "Group" || inner.type === "CapturingGroup") {
		rows.push({
			raw: `${openingDelimiter(inner, inner.alternatives[0]!)} … ${node.raw.slice(inner.end - node.start)}`,
			type: `${innerDesc.type}, quantified`,
			meaning: `${innerDesc.meaning} — the whole group repeated ${quantity}`,
			matches: innerDesc.matches,
			depth,
		});
		walkAlternatives(inner.alternatives, depth + 1, rows);
		return;
	}

	rows.push({
		raw: node.raw,
		type: `${innerDesc.type}, quantified`,
		meaning: `${innerDesc.meaning} — repeated ${quantity}`,
		matches: innerDesc.matches,
		depth,
	});
}

export function tokenizePattern(pattern: AST.Pattern): TokenRow[] {
	const rows: TokenRow[] = [];
	walkAlternatives(pattern.alternatives, 0, rows);
	return rows;
}
