import type { RegexMatch } from "@/lib/tools/regex/types";

interface CaptureGroupsProps {
	match: RegexMatch;
}

export function CaptureGroups({ match }: CaptureGroupsProps) {
	const namedEntries = Object.entries(match.groups);
	const hasNumbered = match.captures.length > 0;
	const hasNamed = namedEntries.length > 0;

	if (!hasNumbered && !hasNamed) {
		return <p className="text-xs text-subtle-foreground">No capture groups.</p>;
	}

	return (
		<div className="space-y-2">
			{hasNumbered && (
				<div className="flex flex-wrap gap-2">
					{match.captures.map((value, index) => (
						<span key={index} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs">
							<span className="text-subtle-foreground">Group {index + 1}: </span>
							<span className="text-foreground">{value ?? "—"}</span>
						</span>
					))}
				</div>
			)}

			{hasNamed && (
				<div className="flex flex-wrap gap-2">
					{namedEntries.map(([name, value]) => (
						<span key={name} className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-xs">
							<span className="text-primary-accent">{name}</span>
							<span className="text-subtle-foreground"> → </span>
							<span className="text-foreground">{value ?? "—"}</span>
						</span>
					))}
				</div>
			)}
		</div>
	);
}
