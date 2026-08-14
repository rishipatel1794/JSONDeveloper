import { FileCode2, FileJson2, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";

export type ImportSourceType = "openapi" | "curl" | "postman";

interface ImportSourceSelectorProps {
	value: ImportSourceType;
	onChange: (value: ImportSourceType) => void;
}

const SOURCES: { value: ImportSourceType; label: string; description: string; icon: typeof FileJson2; available: boolean }[] = [
	{ value: "openapi", label: "OpenAPI / Swagger", description: "OpenAPI 3.0, 3.1, or Swagger 2.0", icon: FileJson2, available: true },
	{ value: "curl", label: "cURL", description: "Coming soon", icon: Terminal, available: false },
	{ value: "postman", label: "Postman Collection", description: "Coming soon", icon: FileCode2, available: false },
];

export function ImportSourceSelector({ value, onChange }: ImportSourceSelectorProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Import source">
			{SOURCES.map(source => (
				<button
					key={source.value}
					type="button"
					role="radio"
					aria-checked={value === source.value}
					disabled={!source.available}
					onClick={() => onChange(source.value)}
					className={cn(
						"flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
						!source.available && "cursor-not-allowed opacity-50",
						source.available && value === source.value
							? "border-primary/40 bg-primary/10"
							: "border-border bg-card hover:bg-secondary",
					)}
				>
					<source.icon className="size-5 text-primary" />
					<span className="text-sm font-medium text-foreground">{source.label}</span>
					<span className="text-xs text-muted-foreground">{source.description}</span>
				</button>
			))}
		</div>
	);
}
