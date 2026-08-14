"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Globe2, Layers, Plus } from "lucide-react";

import type { ResolvedVariable } from "@/lib/api-client/variables/types";
import type { VariableScope } from "@/lib/api-client/workspace/types";

const SCOPE_LABEL: Record<VariableScope, string> = {
	global: "Global",
	environment: "Environment",
	collection: "Collection",
};

const SCOPE_ICON: Record<VariableScope, typeof Globe2> = {
	global: Globe2,
	environment: Globe2,
	collection: Layers,
};

interface VariableHoverCardProps {
	name: string;
	resolved?: ResolvedVariable;
	rect: DOMRect;
	onSave: (newValue: string) => void;
	onCreate: () => void;
	onRequestClose: () => void;
	onPointerEnter: () => void;
	onPointerLeave: () => void;
}

export function VariableHoverCard({ name, resolved, rect, onSave, onCreate, onRequestClose, onPointerEnter, onPointerLeave }: VariableHoverCardProps) {
	const [draftValue, setDraftValue] = useState(resolved?.value ?? "");
	const [revealed, setRevealed] = useState(!resolved?.secret);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setDraftValue(resolved?.value ?? "");
		setRevealed(!resolved?.secret);
	}, [resolved, name]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") onRequestClose();
		}
		function handleScroll() {
			onRequestClose();
		}
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("scroll", handleScroll, true);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [onRequestClose]);

	const top = rect.bottom + 6;
	const left = Math.max(8, Math.min(rect.left, window.innerWidth - 280));

	return (
		<div
			ref={cardRef}
			onMouseEnter={onPointerEnter}
			onMouseLeave={onPointerLeave}
			style={{ top, left }}
			className="fixed z-50 w-64 rounded-lg border border-border bg-card p-3 text-sm shadow-lg"
		>
			<div className="flex items-center justify-between gap-2">
				<span className="truncate font-mono font-semibold text-foreground">{name}</span>
				{resolved && (
					<span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
						{(() => {
							const Icon = SCOPE_ICON[resolved.scope];
							return <Icon className="size-2.5" />;
						})()}
						{SCOPE_LABEL[resolved.scope]}
					</span>
				)}
			</div>

			{resolved ? (
				<>
					<div className="relative mt-2">
						<input
							type={revealed ? "text" : "password"}
							value={draftValue}
							onChange={event => setDraftValue(event.target.value)}
							onKeyDown={event => {
								if (event.key === "Enter") onSave(draftValue);
							}}
							aria-label={`Value for ${name}`}
							spellCheck={false}
							className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 pr-8 font-mono text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
						{resolved.secret && (
							<button
								type="button"
								onClick={() => setRevealed(current => !current)}
								aria-label={revealed ? "Hide value" : "Show value"}
								className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
							</button>
						)}
					</div>
					<button
						type="button"
						onClick={() => onSave(draftValue)}
						className="mt-2 w-full rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
					>
						Save
					</button>
				</>
			) : (
				<>
					<p className="mt-1.5 text-xs text-muted-foreground">Not defined in any scope — the request will send the literal placeholder.</p>
					<button
						type="button"
						onClick={onCreate}
						className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
					>
						<Plus className="size-3.5" />
						Add as Global Variable
					</button>
				</>
			)}
		</div>
	);
}
