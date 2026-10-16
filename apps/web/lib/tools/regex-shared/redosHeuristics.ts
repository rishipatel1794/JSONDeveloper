/**
 * Static, heuristic detection of regex shapes well-known to cause catastrophic backtracking — a
 * best-effort early warning, not a guarantee. It can neither catch every risky pattern nor rule out
 * false positives; the actual protection against a hang is `useSafeRegexMatch`'s worker timeout.
 */
export function detectPotentialCatastrophicBacktracking(pattern: string): string[] {
	const warnings: string[] = [];

	// A quantified group whose own content is itself quantified — e.g. (a+)+, (a*)*, (a+)*, (\d+)+.
	if (/\([^()]*[+*][^()]*\)[?+*]|\([^()]*\{\d*,?\d*\}[^()]*\)[?+*]/.test(pattern)) {
		warnings.push('A quantifier appears inside a group that is itself quantified (e.g. "(a+)+"). This shape is a common cause of catastrophic backtracking on certain inputs.');
	}

	// Alternation with identical or near-identical branches, itself quantified — e.g. (a|a)+, (ab|ab)*.
	if (/\(([^()|]+)\|\1\)[?+*]/.test(pattern)) {
		warnings.push("This pattern repeats an alternation with overlapping branches under a quantifier, which can also cause catastrophic backtracking.");
	}

	return warnings;
}
