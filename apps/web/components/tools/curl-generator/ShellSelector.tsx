import type { Shell } from "@/lib/tools/curl/types";
import { cn } from "@/lib/utils";

const SHELLS: { value: Shell; label: string }[] = [
	{ value: "bash", label: "Bash / Zsh" },
	{ value: "powershell", label: "PowerShell" },
];

interface ShellSelectorProps {
	value: Shell;
	onChange: (value: Shell) => void;
}

export function ShellSelector({ value, onChange }: ShellSelectorProps) {
	return (
		<div className="flex gap-1" role="radiogroup" aria-label="Output shell">
			{SHELLS.map(shell => (
				<button
					key={shell.value}
					type="button"
					role="radio"
					aria-checked={value === shell.value}
					onClick={() => onChange(shell.value)}
					className={cn(
						"rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						value === shell.value
							? "border-primary/40 bg-primary/10 text-primary-accent"
							: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
					)}
				>
					{shell.label}
				</button>
			))}
		</div>
	);
}
