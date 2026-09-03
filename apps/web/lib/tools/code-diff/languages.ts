export interface LanguageOption {
	value: string;
	label: string;
	/** Monaco's language id, used for both the input editors and diff syntax highlighting. */
	monacoId: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
	{ value: "auto", label: "Auto", monacoId: "plaintext" },
	{ value: "javascript", label: "JavaScript", monacoId: "javascript" },
	{ value: "typescript", label: "TypeScript", monacoId: "typescript" },
	{ value: "json", label: "JSON", monacoId: "json" },
	{ value: "html", label: "HTML", monacoId: "html" },
	{ value: "css", label: "CSS", monacoId: "css" },
	{ value: "sql", label: "SQL", monacoId: "sql" },
	{ value: "python", label: "Python", monacoId: "python" },
	{ value: "java", label: "Java", monacoId: "java" },
	{ value: "php", label: "PHP", monacoId: "php" },
	{ value: "bash", label: "Bash", monacoId: "shell" },
	{ value: "yaml", label: "YAML", monacoId: "yaml" },
	{ value: "markdown", label: "Markdown", monacoId: "markdown" },
	{ value: "plaintext", label: "Plain Text", monacoId: "plaintext" },
];

export function resolveMonacoLanguage(value: string): string {
	return LANGUAGE_OPTIONS.find(option => option.value === value)?.monacoId ?? "plaintext";
}

/**
 * A best-effort content sniff for the "Auto" language option — good enough to pick a syntax
 * highlighting theme, not meant to be a real parser/classifier.
 */
export function detectLanguage(code: string): string {
	const sample = code.trim();
	if (!sample) return "plaintext";

	if (/^[{[]/.test(sample)) {
		try {
			JSON.parse(sample);
			return "json";
		} catch {
			// Not valid JSON — fall through to other heuristics.
		}
	}

	if (/^<\?php/.test(sample)) return "php";
	if (/^(<!doctype html|<html[\s>])/i.test(sample)) return "html";
	if (/<\/?[a-z][\s\S]*>/i.test(sample) && /<\/[a-z]+>/i.test(sample)) return "html";
	if (/^#!.*\b(bash|sh|zsh)\b/.test(sample) || /\b(fi|then|echo\s+["'$])/.test(sample)) return "bash";
	if (/\b(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE)\b/i.test(sample)) return "sql";
	if (/^(import|from)\s+\S+.*\bimport\b|def\s+\w+\(.*\):|:\s*$/m.test(sample) && /def\s+\w+\(/.test(sample)) return "python";
	if (/\b(public|private)\s+(static\s+)?(class|void|int|String)\b/.test(sample)) return "java";
	if (/interface\s+\w+|:\s*(string|number|boolean)\b|<[A-Za-z]+>\s*\(/.test(sample)) return "typescript";
	if (/\b(function|const|let|var)\b.*[={(]|=>/.test(sample)) return "javascript";
	if (/^[.#]?[\w-]+\s*\{[\s\S]*:[\s\S]*;[\s\S]*\}/.test(sample)) return "css";
	if (/^[\w-]+:\s/m.test(sample)) return "yaml";

	return "plaintext";
}
