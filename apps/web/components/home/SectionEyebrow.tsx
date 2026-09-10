interface SectionEyebrowProps {
	index: number;
	label: string;
}

/** A small numbered label above a section heading — used sparingly for a documentation/technical feel. */
export function SectionEyebrow({ index, label }: SectionEyebrowProps) {
	return (
		<div className="mb-3 flex items-center justify-center gap-2 font-mono text-xs font-medium tracking-widest text-primary" aria-hidden="true">
			<span>{String(index).padStart(2, "0")}</span>
			<span className="h-px w-4 bg-primary/40" />
			<span className="text-subtle-foreground">{label}</span>
		</div>
	);
}
