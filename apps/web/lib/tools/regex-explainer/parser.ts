import { AST, RegExpParser, RegExpSyntaxError } from "@eslint-community/regexpp";

export interface ParseSuccess {
	success: true;
	pattern: AST.Pattern;
}

export interface ParseFailure {
	success: false;
	error: string;
	index?: number;
}

export type ParseResult = ParseSuccess | ParseFailure;

/**
 * Parses with `@eslint-community/regexpp` — a maintained, AST-producing ECMAScript regex parser (the
 * same one ESLint itself uses for its regex lint rules) rather than hand-rolled string inspection.
 * Supported syntax is whatever this parser's targeted ECMAScript version supports; unsupported or
 * invalid syntax surfaces as a clear parse error instead of a wrong or partial explanation.
 */
export function parseRegexPattern(pattern: string, flags: string): ParseResult {
	const parser = new RegExpParser();

	try {
		const node = parser.parsePattern(pattern, undefined, undefined, {
			unicode: flags.includes("u"),
			unicodeSets: flags.includes("v"),
		});
		return { success: true, pattern: node };
	} catch (error) {
		if (error instanceof RegExpSyntaxError) {
			return { success: false, error: error.message, index: error.index };
		}
		return { success: false, error: error instanceof Error ? error.message : "This is not a valid regular expression." };
	}
}
