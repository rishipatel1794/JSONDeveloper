import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "How does the Code Diff tool detect changes?",
		answer:
			"It runs a line-based diff algorithm that finds the longest common sequence of lines between the two versions, then marks everything else as added or removed — the same approach used by git diff. A changed line shows up as its old version removed and its new version added.",
	},
	{
		question: "Is my code uploaded anywhere?",
		answer:
			"No. Everything — pasted text, uploaded files, and the diff calculation itself — runs entirely in your browser. Nothing is sent to a server, logged, or stored remotely, which makes it safe to compare code containing API keys, config values, or other sensitive content.",
	},
	{
		question: "What's the difference between Split and Unified view?",
		answer:
			"Split view shows the original and modified code in two side-by-side columns, like a GitHub pull request diff. Unified view shows both versions in a single column with +/- markers, which is easier to read on narrow screens or when you want a compact, copyable diff.",
	},
	{
		question: "What does \"Ignore Whitespace\" do?",
		answer:
			"It treats two lines as identical if they only differ in leading, trailing, or repeated whitespace — useful when re-indentation or formatting changes would otherwise bury the real changes in noise.",
	},
	{
		question: "What does \"Ignore Empty Lines\" do?",
		answer:
			"It excludes blank-line additions or removals from the comparison, so reformatting that only adds or removes blank lines between blocks doesn't show up as a change.",
	},
	{
		question: "Can I compare uploaded files instead of pasting code?",
		answer:
			"Yes — use the upload button on either editor, or drag and drop a text/code file directly onto it. Files are read locally with the browser's File API and never leave your device.",
	},
];

export function CodeDiffFaq() {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>

				<div className="mt-8">
					<Accordion items={FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
