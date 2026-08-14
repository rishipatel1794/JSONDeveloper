import type { LucideIcon } from "lucide-react";

interface ToolPageHeaderProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function ToolPageHeader({ icon: Icon, title, description }: ToolPageHeaderProps) {
	return (
		<div className="mb-8 flex items-center gap-3">
			<div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
				<Icon className="size-6" />
			</div>

			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
				<p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
			</div>
		</div>
	);
}
