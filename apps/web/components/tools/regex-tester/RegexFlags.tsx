import { REGEX_FLAGS } from "@/lib/tools/regex/types";
import { cn } from "@/lib/utils";

interface RegexFlagsProps {
	flags: Set<string>;
	onToggle: (flag: string) => void;
}

export function RegexFlags({ flags, onToggle }: RegexFlagsProps) {
	return (
		<div className="flex flex-wrap gap-2" role="group" aria-label="Regular expression flags">
			{REGEX_FLAGS.map(({ flag, label, description }) => {
				const active = flags.has(flag);

				return (
					<button
						key={flag}
						type="button"
						onClick={() => onToggle(flag)}
						aria-pressed={active}
						title={`${label} — ${description}`}
						className={cn(
							"flex min-w-14 flex-col items-center gap-0.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							active
								? "border-primary/40 bg-primary/10 text-primary-accent"
								: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
						)}
					>
						<span className="font-mono text-sm">{flag}</span>
						<span>{label}</span>
					</button>
				);
			})}
		</div>
	);
}
