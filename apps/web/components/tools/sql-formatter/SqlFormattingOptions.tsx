import { ChevronDown } from "lucide-react";

import { INDENT_SIZES, KEYWORD_CASES, type KeywordCase } from "@/lib/tools/sql/types";
import { cn } from "@/lib/utils";

interface SqlFormattingOptionsProps {
	keywordCase: KeywordCase;
	onKeywordCaseChange: (value: KeywordCase) => void;
	tabWidth: number;
	onTabWidthChange: (value: number) => void;
}

const optionButton = (active: boolean) =>
	cn(
		"rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		active
			? "border-primary/40 bg-primary/10 text-primary-accent"
			: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
	);

export function SqlFormattingOptions({ keywordCase, onKeywordCaseChange, tabWidth, onTabWidthChange }: SqlFormattingOptionsProps) {
	return (
		<details className="group rounded-md border border-border bg-background">
			<summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium text-foreground">
				Formatting Options
				<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
			</summary>

			<div className="flex flex-wrap gap-6 border-t border-border-subtle px-3 py-3">
				<div>
					<p className="mb-1.5 text-xs font-medium text-muted-foreground">Keyword Case</p>
					<div className="flex gap-1" role="radiogroup" aria-label="Keyword case">
						{KEYWORD_CASES.map(option => (
							<button
								key={option.value}
								type="button"
								role="radio"
								aria-checked={keywordCase === option.value}
								onClick={() => onKeywordCaseChange(option.value)}
								className={optionButton(keywordCase === option.value)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				<div>
					<p className="mb-1.5 text-xs font-medium text-muted-foreground">Indent Size</p>
					<div className="flex gap-1" role="radiogroup" aria-label="Indent size">
						{INDENT_SIZES.map(size => (
							<button
								key={size}
								type="button"
								role="radio"
								aria-checked={tabWidth === size}
								onClick={() => onTabWidthChange(size)}
								className={optionButton(tabWidth === size)}
							>
								{size}
							</button>
						))}
					</div>
				</div>
			</div>
		</details>
	);
}
