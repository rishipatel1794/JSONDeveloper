const SECTIONS = [
	{
		title: "What is a code diff?",
		body: "A code diff (short for \"difference\") is a line-by-line comparison between two versions of the same file or snippet. It highlights exactly which lines were added, removed, or changed — the same view you see when reviewing a pull request on GitHub or GitLab, or running git diff from the command line.",
	},
	{
		title: "How to compare two code snippets",
		body: "Paste your original code on the left and the modified version on the right (or upload files, or drag and drop them onto either editor), then click Compare. The tool highlights added lines in green, removed lines in red, and leaves unchanged lines untouched, with line numbers preserved on both sides.",
	},
	{
		title: "Split view vs. unified diff",
		body: "Split view puts the original and modified code in two columns so you can scan both versions independently — the clearest option on a wide screen. Unified view merges both into a single column with +/- markers, closer to a raw `diff -u` or `git diff` output, and is easier to copy or read on a narrow screen.",
	},
	{
		title: "Why does a single edited line show as two lines?",
		body: "A modified line is represented as its old text being removed and its new text being added, rather than a single ambiguous \"changed\" line. This matches how real diff tools work and makes it unambiguous exactly what the old and new text were.",
	},
];

export function CodeDiffSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding code diffs</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
