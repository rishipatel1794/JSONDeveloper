export type CodeExportLanguage = "javascript" | "python" | "php" | "java";

export interface CodeExportResult {
	language: CodeExportLanguage;
	label: string;
	code: string;
	warnings: string[];
}

function escapeForDoubleQuotedString(source: string): string {
	return source.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildJavaScript(pattern: string, flags: string): CodeExportResult {
	const warnings: string[] = [];
	if (flags.includes("y")) warnings.push('The "y" (sticky) flag only affects repeated calls via `lastIndex` — it has no equivalent in a single match call.');

	const escaped = escapeForDoubleQuotedString(pattern);
	return { language: "javascript", label: "JavaScript", code: `const regex = new RegExp("${escaped}", "${flags}");`, warnings };
}

function buildPython(pattern: string, flags: string): CodeExportResult {
	const warnings: string[] = [];
	const pyFlags: string[] = [];

	if (flags.includes("i")) pyFlags.push("re.IGNORECASE");
	if (flags.includes("m")) pyFlags.push("re.MULTILINE");
	if (flags.includes("s")) pyFlags.push("re.DOTALL");
	if (flags.includes("g")) warnings.push('Python has no "global" compile flag — use `re.findall()` or `re.finditer()` to get every match instead of just the first.');
	if (flags.includes("y")) warnings.push('Python has no equivalent of JavaScript\'s "y" (sticky) flag.');
	if (flags.includes("u")) warnings.push("Python 3 strings are Unicode by default, so there's no separate unicode flag to set.");

	const quote = pattern.includes('"') && !pattern.includes("'") ? "'" : '"';
	const rawLiteral = pattern.endsWith("\\") || pattern.includes(quote) ? `${quote}${pattern.replace(new RegExp(quote, "g"), `\\${quote}`)}${quote}` : `r${quote}${pattern}${quote}`;

	const flagsArg = pyFlags.length > 0 ? `, ${pyFlags.join(" | ")}` : "";
	return { language: "python", label: "Python", code: `import re\n\npattern = re.compile(${rawLiteral}${flagsArg})`, warnings };
}

function buildPhp(pattern: string, flags: string): CodeExportResult {
	const warnings: string[] = [];
	const phpFlags: string[] = [];

	if (flags.includes("i")) phpFlags.push("i");
	if (flags.includes("m")) phpFlags.push("m");
	if (flags.includes("s")) phpFlags.push("s");
	if (flags.includes("u")) phpFlags.push("u");
	if (flags.includes("g")) warnings.push('PHP has no "global" modifier — use `preg_match_all()` instead of `preg_match()` to get every match.');
	if (flags.includes("y")) warnings.push('PHP has no equivalent of JavaScript\'s "y" (sticky) flag.');

	// PCRE needs a delimiter not present unescaped in the pattern; "/" is conventional but must be
	// escaped if the pattern itself uses it, so switch to "#" instead when the pattern already contains "/".
	const delimiter = pattern.includes("/") ? "#" : "/";
	const escapedPattern = delimiter === "#" ? pattern.replace(/#/g, "\\#") : pattern;

	return {
		language: "php",
		label: "PHP",
		code: `$pattern = '${delimiter}${escapedPattern.replace(/'/g, "\\'")}${delimiter}${phpFlags.join("")}';\npreg_match($pattern, $subject, $matches);`,
		warnings,
	};
}

function buildJava(pattern: string, flags: string): CodeExportResult {
	const warnings: string[] = [];
	const javaFlags: string[] = [];

	if (flags.includes("i")) javaFlags.push("Pattern.CASE_INSENSITIVE");
	if (flags.includes("m")) javaFlags.push("Pattern.MULTILINE");
	if (flags.includes("s")) javaFlags.push("Pattern.DOTALL");
	if (flags.includes("u")) javaFlags.push("Pattern.UNICODE_CASE");
	if (flags.includes("g")) warnings.push('Java has no "global" compile flag — call `Matcher.find()` in a loop to get every match.');
	if (flags.includes("y")) warnings.push('Java has no equivalent of JavaScript\'s "y" (sticky) flag — `Matcher.lookingAt()` anchored matching is the closest analog.');

	const escaped = escapeForDoubleQuotedString(pattern);
	const flagsArg = javaFlags.length > 0 ? `, ${javaFlags.join(" | ")}` : "";
	return { language: "java", label: "Java", code: `Pattern pattern = Pattern.compile("${escaped}"${flagsArg});`, warnings };
}

export function buildCodeSnippets(pattern: string, flags: string): CodeExportResult[] {
	return [buildJavaScript(pattern, flags), buildPython(pattern, flags), buildPhp(pattern, flags), buildJava(pattern, flags)];
}
