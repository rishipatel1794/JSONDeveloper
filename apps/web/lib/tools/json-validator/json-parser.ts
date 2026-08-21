import type { DuplicateKeyOccurrence, JsonSyntaxError, SourceLocation } from "./types";

/**
 * A hand-rolled, RFC 8259 JSON parser used purely for diagnostics — native `JSON.parse` is still
 * what actually produces the value used everywhere else in this tool (statistics, tree, generators),
 * since it's battle-tested and faster. This parser exists only because `JSON.parse` can't give us
 * two things the validator needs: an exact line/column for syntax errors, and duplicate object keys
 * (which `JSON.parse` silently collapses to the last occurrence).
 */

class JsonSyntaxException extends Error {
	friendlyMessage: string;
	line: number;
	column: number;
	position: number;

	constructor(message: string, friendlyMessage: string, location: SourceLocation) {
		super(message);
		this.friendlyMessage = friendlyMessage;
		this.line = location.line;
		this.column = location.column;
		this.position = location.position;
	}
}

type TokenType =
	| "brace-open"
	| "brace-close"
	| "bracket-open"
	| "bracket-close"
	| "colon"
	| "comma"
	| "string"
	| "number"
	| "true"
	| "false"
	| "null"
	| "eof";

interface Token {
	type: TokenType;
	value?: string | number;
	location: SourceLocation;
}

const PUNCTUATION: Record<string, TokenType> = {
	"{": "brace-open",
	"}": "brace-close",
	"[": "bracket-open",
	"]": "bracket-close",
	":": "colon",
	",": "comma",
};

class Scanner {
	private readonly text: string;
	private pos = 0;
	private line = 1;
	private column = 1;

	constructor(text: string) {
		this.text = text;
	}

	private here(): SourceLocation {
		return { line: this.line, column: this.column, position: this.pos };
	}

	private peek(offset = 0): string {
		return this.text[this.pos + offset] ?? "";
	}

	private advance(): string {
		const ch = this.text[this.pos] ?? "";
		this.pos++;
		if (ch === "\n") {
			this.line++;
			this.column = 1;
		} else {
			this.column++;
		}
		return ch;
	}

	private skipWhitespace(): void {
		while (this.pos < this.text.length && /[ \t\n\r]/.test(this.peek())) {
			this.advance();
		}
	}

	private error(message: string, friendlyMessage: string, location?: SourceLocation): never {
		throw new JsonSyntaxException(message, friendlyMessage, location ?? this.here());
	}

	private readString(): Token {
		const start = this.here();
		this.advance(); // consume opening quote

		let value = "";
		while (true) {
			if (this.pos >= this.text.length) {
				this.error("Unexpected end of JSON input", "This string is never closed — a closing double quote is missing.", start);
			}

			const ch = this.peek();

			if (ch === '"') {
				this.advance();
				break;
			}

			if (ch === "\\") {
				this.advance();
				const escaped = this.advance();
				switch (escaped) {
					case '"':
						value += '"';
						break;
					case "\\":
						value += "\\";
						break;
					case "/":
						value += "/";
						break;
					case "b":
						value += "\b";
						break;
					case "f":
						value += "\f";
						break;
					case "n":
						value += "\n";
						break;
					case "r":
						value += "\r";
						break;
					case "t":
						value += "\t";
						break;
					case "u": {
						const hex = this.text.slice(this.pos, this.pos + 4);
						if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
							this.error("Invalid unicode escape sequence", "This \\u escape sequence must be followed by exactly 4 hexadecimal digits.");
						}
						for (let i = 0; i < 4; i++) this.advance();
						value += String.fromCharCode(parseInt(hex, 16));
						break;
					}
					default:
						this.error(
							`Invalid escape character '\\${escaped}'`,
							`'\\${escaped}' is not a valid escape sequence. Valid escapes are \\" \\\\ \\/ \\b \\f \\n \\r \\t and \\uXXXX.`,
						);
				}
				continue;
			}

			if (ch.charCodeAt(0) < 0x20) {
				this.error("Unescaped control character in string", "Control characters must be escaped inside a JSON string.");
			}

			value += this.advance();
		}

		return { type: "string", value, location: start };
	}

	private readNumber(): Token {
		const start = this.here();
		let raw = "";

		if (this.peek() === "-") raw += this.advance();

		if (this.peek() === "0") {
			raw += this.advance();
		} else if (/[1-9]/.test(this.peek())) {
			while (/[0-9]/.test(this.peek())) raw += this.advance();
		} else {
			this.error("Invalid number", "Expected a digit after '-'.", start);
		}

		if (this.peek() === ".") {
			raw += this.advance();
			if (!/[0-9]/.test(this.peek())) this.error("Invalid number", "Expected a digit after the decimal point.");
			while (/[0-9]/.test(this.peek())) raw += this.advance();
		}

		if (this.peek() === "e" || this.peek() === "E") {
			raw += this.advance();
			if (this.peek() === "+" || this.peek() === "-") raw += this.advance();
			if (!/[0-9]/.test(this.peek())) this.error("Invalid number", "Expected a digit in the exponent.");
			while (/[0-9]/.test(this.peek())) raw += this.advance();
		}

		return { type: "number", value: Number(raw), location: start };
	}

	private readLiteral(word: "true" | "false" | "null"): Token {
		const start = this.here();
		for (const expected of word) {
			if (this.peek() !== expected) {
				this.error(`Unexpected token, expected '${word}'`, `Expected the literal "${word}" here.`, start);
			}
			this.advance();
		}
		return { type: word, location: start };
	}

	next(): Token {
		this.skipWhitespace();

		if (this.pos >= this.text.length) {
			return { type: "eof", location: this.here() };
		}

		const ch = this.peek();

		if (ch === '"') return this.readString();
		if (ch === "-" || /[0-9]/.test(ch)) return this.readNumber();
		if (ch === "t") return this.readLiteral("true");
		if (ch === "f") return this.readLiteral("false");
		if (ch === "n") return this.readLiteral("null");

		if (ch === "'") {
			this.error(
				"Single quotes are not valid JSON",
				"JSON requires double quotes for property names and strings — single quotes are not allowed.",
			);
		}

		const punctuation = PUNCTUATION[ch];
		if (punctuation) {
			const start = this.here();
			this.advance();
			return { type: punctuation, location: start };
		}

		this.error(`Unexpected token '${ch}'`, `'${ch}' is not valid here.`);
	}
}

interface ParseContext {
	duplicates: Map<string, DuplicateKeyOccurrence>;
}

function pathKey(path: string, key: string): string {
	return `${path}::${key}`;
}

function recordKeyOccurrence(ctx: ParseContext, path: string, key: string, location: SourceLocation): void {
	const mapKey = pathKey(path, key);
	const existing = ctx.duplicates.get(mapKey);
	if (existing) {
		existing.locations.push(location);
	} else {
		ctx.duplicates.set(mapKey, { key, path, locations: [location] });
	}
}

function childPath(path: string, key: string): string {
	return path ? `${path}.${key}` : key;
}

function arrayItemPath(path: string, index: number): string {
	return `${path}[${index}]`;
}

class Parser {
	private readonly scanner: Scanner;
	private current: Token;
	private readonly ctx: ParseContext;

	constructor(scanner: Scanner, ctx: ParseContext) {
		this.scanner = scanner;
		this.ctx = ctx;
		this.current = scanner.next();
	}

	private advance(): Token {
		const token = this.current;
		this.current = this.scanner.next();
		return token;
	}

	private expect(type: TokenType, message: string, friendlyMessage: string): Token {
		if (this.current.type !== type) {
			throw new JsonSyntaxException(message, friendlyMessage, this.current.location);
		}
		return this.advance();
	}

	parseDocument(): void {
		this.parseValue("");
		if (this.current.type !== "eof") {
			throw new JsonSyntaxException(
				`Unexpected token after JSON value`,
				"Unexpected extra content after the JSON value — only one top-level value is allowed.",
				this.current.location,
			);
		}
	}

	private parseValue(path: string): void {
		switch (this.current.type) {
			case "brace-open":
				this.parseObject(path);
				return;
			case "bracket-open":
				this.parseArray(path);
				return;
			case "string":
			case "number":
			case "true":
			case "false":
			case "null":
				this.advance();
				return;
			case "eof":
				throw new JsonSyntaxException("Unexpected end of JSON input", "The JSON input ends unexpectedly — a value is missing.", this.current.location);
			default:
				throw new JsonSyntaxException(`Unexpected token`, "A value was expected here (an object, array, string, number, true, false, or null).", this.current.location);
		}
	}

	private parseObject(path: string): void {
		this.advance(); // consume '{'
		const seenKeys = new Map<string, SourceLocation[]>();

		if (this.current.type === "brace-close") {
			this.advance();
			return;
		}

		while (true) {
			if (this.current.type !== "string") {
				throw new JsonSyntaxException(
					"Expected a property name (string)",
					"Object property names must be double-quoted strings.",
					this.current.location,
				);
			}

			const keyToken = this.advance();
			const key = String(keyToken.value);
			const existing = seenKeys.get(key);
			if (existing) existing.push(keyToken.location);
			else seenKeys.set(key, [keyToken.location]);

			this.expect("colon", "Expected ':' after property name", "Expected ':' between the property name and its value.");
			this.parseValue(childPath(path, key));

			// TypeScript's control-flow narrowing incorrectly keeps treating `this.current.type` as
			// still constrained by the "string" check above, even after the `advance()`/`parseValue()`
			// calls in between that actually change it — hence the explicit re-widening casts below.
			const afterValueType = this.current.type as TokenType;

			if (afterValueType === "comma") {
				this.advance();
				const afterCommaType = this.current.type as TokenType;
				if (afterCommaType === "brace-close") {
					throw new JsonSyntaxException(
						"Trailing comma before '}'",
						"Trailing comma detected. JSON does not allow a comma after the final property.",
						this.current.location,
					);
				}
				continue;
			}

			if (afterValueType === "brace-close") {
				this.advance();
				break;
			}

			if (afterValueType === "string") {
				throw new JsonSyntaxException("Expected ',' or '}'", "Expected ',' between JSON properties.", this.current.location);
			}

			throw new JsonSyntaxException("Expected ',' or '}'", "Expected ',' or '}' here.", this.current.location);
		}

		for (const [key, locations] of seenKeys) {
			if (locations.length > 1) {
				for (const location of locations) recordKeyOccurrence(this.ctx, path, key, location);
			}
		}
	}

	private parseArray(path: string): void {
		this.advance(); // consume '['

		if (this.current.type === "bracket-close") {
			this.advance();
			return;
		}

		let index = 0;
		while (true) {
			this.parseValue(arrayItemPath(path, index));
			index++;

			const afterValueType = this.current.type as TokenType;

			if (afterValueType === "comma") {
				this.advance();
				const afterCommaType = this.current.type as TokenType;
				if (afterCommaType === "bracket-close") {
					throw new JsonSyntaxException(
						"Trailing comma before ']'",
						"Trailing comma detected. JSON does not allow a comma after the final array element.",
						this.current.location,
					);
				}
				continue;
			}

			if (afterValueType === "bracket-close") {
				this.advance();
				break;
			}

			throw new JsonSyntaxException("Expected ',' or ']'", "Expected ',' or ']' between array elements.", this.current.location);
		}
	}
}

export interface DiagnosticParseResult {
	success: boolean;
	error?: JsonSyntaxError;
	duplicates: DuplicateKeyOccurrence[];
}

/** Runs the diagnostic parser purely for its side effects: precise error location and duplicate keys. */
export function parseJsonWithDiagnostics(input: string): DiagnosticParseResult {
	const ctx: ParseContext = { duplicates: new Map() };

	try {
		const scanner = new Scanner(input);
		const parser = new Parser(scanner, ctx);
		parser.parseDocument();

		return { success: true, duplicates: [...ctx.duplicates.values()] };
	} catch (error) {
		if (error instanceof JsonSyntaxException) {
			return {
				success: false,
				error: {
					message: error.message,
					friendlyMessage: error.friendlyMessage,
					line: error.line,
					column: error.column,
					position: error.position,
				},
				duplicates: [...ctx.duplicates.values()],
			};
		}

		// Should be unreachable — every throw site in this module raises JsonSyntaxException — but
		// never let a bug in the diagnostic parser crash the app; fall back to a generic message.
		return {
			success: false,
			error: { message: "Invalid JSON", friendlyMessage: "This input is not valid JSON.", line: 1, column: 1, position: 0 },
			duplicates: [],
		};
	}
}
