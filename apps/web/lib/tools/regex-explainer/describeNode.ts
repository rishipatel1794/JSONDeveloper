import type { AST } from "@eslint-community/regexpp";

export interface NodeDescription {
	type: string;
	meaning: string;
	matches: string;
}

function charLabel(value: number): string {
	const char = String.fromCodePoint(value);
	if (char === " ") return '" " (space)';
	if (char === "\t") return "tab character";
	if (char === "\n") return "newline character";
	// eslint-disable-next-line no-control-regex -- deliberately detecting control characters to label them, not a mistaken literal
	if (/[\x00-\x1f]/.test(char)) return `control character (code point ${value})`;
	return `"${char}"`;
}

export function describeQuantifiable(node: AST.QuantifiableElement): NodeDescription {
	switch (node.type) {
		case "Character":
			return { type: "Literal character", meaning: `Matches the literal character ${charLabel(node.value)}`, matches: charLabel(node.value) };

		case "CharacterSet":
			return describeCharacterSet(node);

		case "CharacterClass":
			return describeCharacterClass(node);

		case "Backreference": {
			const ref = typeof node.ref === "number" ? `group #${node.ref}` : `the group named "${node.ref}"`;
			return { type: "Backreference", meaning: `Matches the same text that was captured by ${ref} earlier in the pattern`, matches: `whatever ${ref} actually matched` };
		}

		case "CapturingGroup": {
			const name = node.name ? ` named "${node.name}"` : "";
			return { type: `Capturing group${name}`, meaning: `A capturing group${name} — its match is remembered and can be referenced or extracted afterward`, matches: "its inner pattern (see nested rows)" };
		}

		case "Group":
			return { type: "Non-capturing group", meaning: "Groups its contents together (for applying a quantifier or alternation) without remembering the match", matches: "its inner pattern (see nested rows)" };

		case "ExpressionCharacterClass":
			return { type: "Character class (set operation)", meaning: "A v-flag character class using set operations (union, intersection, or subtraction)", matches: node.raw };

		default:
			return { type: node.type, meaning: "An element of this type", matches: node.raw };
	}
}

function describeCharacterSet(node: AST.CharacterSet): NodeDescription {
	if (node.kind === "any") {
		return { type: "Wildcard", meaning: "Matches any single character", matches: "any character except a line terminator, unless the s flag is set" };
	}

	if (node.kind === "digit") {
		return node.negate
			? { type: "Character class (negated shorthand)", meaning: "Matches any character that is NOT a digit", matches: "anything except 0-9" }
			: { type: "Character class (shorthand)", meaning: "Matches any digit", matches: "0-9" };
	}

	if (node.kind === "space") {
		return node.negate
			? { type: "Character class (negated shorthand)", meaning: "Matches any character that is NOT whitespace", matches: "anything except spaces, tabs, and line breaks" }
			: { type: "Character class (shorthand)", meaning: "Matches any whitespace character", matches: "spaces, tabs, and line breaks" };
	}

	if (node.kind === "word") {
		return node.negate
			? { type: "Character class (negated shorthand)", meaning: "Matches any character that is NOT a word character", matches: "anything except letters, digits, and underscore" }
			: { type: "Character class (shorthand)", meaning: "Matches any word character", matches: "letters, digits, and underscore (a-z, A-Z, 0-9, _)" };
	}

	// Unicode property escapes (\p{...} / \P{...})
	const negate = "negate" in node ? node.negate : false;
	return {
		type: "Unicode property escape",
		meaning: `Matches ${negate ? "characters that do NOT have" : "a character with"} the Unicode property described by ${node.raw}`,
		matches: node.raw,
	};
}

function describeCharacterClass(node: AST.CharacterClass): NodeDescription {
	const parts = node.elements.map(element => {
		if (element.type === "CharacterClassRange") {
			return `${charLabel(element.min.value)} to ${charLabel(element.max.value)}`;
		}
		if (element.type === "Character") {
			return charLabel(element.value);
		}
		if (element.type === "CharacterSet") {
			return describeCharacterSet(element).matches;
		}
		return element.raw;
	});

	const negated = "negate" in node && node.negate;
	return {
		type: negated ? "Negated character class" : "Character class",
		meaning: negated ? `Matches any single character NOT in this set: ${parts.join(", ")}` : `Matches any single character from this set: ${parts.join(", ")}`,
		matches: parts.join(", "),
	};
}

export function describeAssertion(node: AST.Assertion): NodeDescription {
	if (node.kind === "start") {
		return { type: "Anchor", meaning: "Matches the start of the input (or of a line, if the m flag is set)", matches: "a position, not a character" };
	}
	if (node.kind === "end") {
		return { type: "Anchor", meaning: "Matches the end of the input (or of a line, if the m flag is set)", matches: "a position, not a character" };
	}
	if (node.kind === "word") {
		return node.negate
			? { type: "Boundary", meaning: "Matches a position that is NOT a word boundary", matches: "a position, not a character" }
			: { type: "Boundary", meaning: "Matches a word boundary — the position between a word character and a non-word character", matches: "a position, not a character" };
	}
	if (node.kind === "lookahead") {
		return {
			type: node.negate ? "Negative lookahead" : "Positive lookahead",
			meaning: node.negate ? "Asserts that what follows does NOT match the inner pattern, without consuming any characters" : "Asserts that what follows matches the inner pattern, without consuming any characters",
			matches: "a position, not a character — see nested rows for the inner pattern",
		};
	}
	const lookbehind = node as AST.LookbehindAssertion;
	return {
		type: lookbehind.negate ? "Negative lookbehind" : "Positive lookbehind",
		meaning: lookbehind.negate ? "Asserts that what precedes does NOT match the inner pattern, without consuming any characters" : "Asserts that what precedes matches the inner pattern, without consuming any characters",
		matches: "a position, not a character — see nested rows for the inner pattern",
	};
}

export function describeQuantifier(min: number, max: number, greedy: boolean): string {
	const laziness = greedy ? "" : ", as few times as possible (lazy)";
	if (min === 0 && max === Infinity) return `zero or more times${laziness}`;
	if (min === 1 && max === Infinity) return `one or more times${laziness}`;
	if (min === 0 && max === 1) return `zero or one time (optional)${laziness}`;
	if (min === max) return `exactly ${min} time${min === 1 ? "" : "s"}`;
	if (max === Infinity) return `${min} or more times${laziness}`;
	return `between ${min} and ${max} times${laziness}`;
}
