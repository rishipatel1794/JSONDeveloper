"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

import { tokenizeVariableString, type VariableToken } from "@/lib/api-client/variables/resolver";
import type { ResolvedVariable } from "@/lib/api-client/variables/types";
import { cn } from "@/lib/utils";

import { VariableHoverCard } from "./VariableHoverCard";

interface VariableAwareUrlInputProps {
	value: string;
	onChange: (value: string) => void;
	error?: string;
	variableMap: Map<string, ResolvedVariable>;
	onUpdateVariable: (variable: ResolvedVariable, newValue: string) => void;
	onCreateGlobalVariable: (name: string) => void;
}

interface TokenPosition {
	name: string;
	left: number;
	width: number;
}

interface HoverState {
	name: string;
	rect: DOMRect;
}

// Shared by the input and its mirror so measured text positions line up exactly.
const FIELD_TEXT_CLASSES = "h-11 w-full min-w-0 px-3 font-mono text-sm";

/**
 * The URL field is a REAL <input> — all typing, caret movement, and horizontal scrolling are 100%
 * native, so none of that can go wrong. A hidden "mirror" div underneath, styled identically,
 * renders the same text so each {{VAR}} token's on-screen pixel position can be measured via
 * offsetLeft/offsetWidth. Those measurements position two things: a highlight rectangle behind the
 * token (in a layer between the mirror and the input) and the hover hit-test target.
 */
export function VariableAwareUrlInput({ value, onChange, error, variableMap, onUpdateVariable, onCreateGlobalVariable }: VariableAwareUrlInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const tokenElsRef = useRef<Map<number, HTMLSpanElement>>(new Map());

	const [positions, setPositions] = useState<TokenPosition[]>([]);
	const [hover, setHover] = useState<HoverState | null>(null);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const tokens = tokenizeVariableString(value);

	useLayoutEffect(() => {
		const next: TokenPosition[] = [];
		tokenElsRef.current.forEach((el, index) => {
			const token: VariableToken | undefined = tokens[index];
			if (token?.type === "variable" && token.name) next.push({ name: token.name, left: el.offsetLeft, width: el.offsetWidth });
		});
		setPositions(next);
		syncScroll();
		// Re-measure whenever the rendered text changes — tokenElsRef is populated by refs during this same commit.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	function syncScroll() {
		const input = inputRef.current;
		const track = trackRef.current;
		if (input && track) track.style.transform = `translateX(${-input.scrollLeft}px)`;
	}

	function scheduleClose() {
		clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => setHover(null), 150);
	}

	function cancelClose() {
		clearTimeout(closeTimerRef.current);
	}

	function handleScroll() {
		syncScroll();
		setHover(null); // The hovered token's screen position is now stale.
	}

	function handleMouseMove(event: ReactMouseEvent<HTMLInputElement>) {
		const input = inputRef.current;
		if (!input) return;

		const inputRect = input.getBoundingClientRect();
		const localX = event.clientX - inputRect.left + input.scrollLeft;
		const hit = positions.find(position => localX >= position.left && localX <= position.left + position.width);

		if (!hit) {
			scheduleClose();
			return;
		}

		cancelClose();
		if (hover?.name === hit.name) return;

		const rectLeft = inputRect.left + hit.left - input.scrollLeft;
		setHover({ name: hit.name, rect: new DOMRect(rectLeft, inputRect.top, hit.width, inputRect.height) });
	}

	const hoveredVariable = hover ? variableMap.get(hover.name) : undefined;

	return (
		<div className="relative min-w-0 flex-1">
			<div
				className={cn(
					"relative h-11 w-full overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
					error ? "border-destructive" : "border-border",
				)}
			>
				<div ref={trackRef} className="pointer-events-none absolute inset-0">
					{positions.map(position => (
						<span
							key={position.name + position.left}
							style={{ left: position.left, width: position.width }}
							className={cn("absolute top-2 bottom-2 rounded", variableMap.has(position.name) ? "bg-primary/15" : "bg-destructive-muted")}
						/>
					))}
				</div>

				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={event => onChange(event.target.value)}
					onScroll={handleScroll}
					onMouseMove={handleMouseMove}
					onMouseLeave={scheduleClose}
					placeholder="https://api.example.com/endpoint"
					spellCheck={false}
					autoComplete="off"
					autoCorrect="off"
					aria-invalid={Boolean(error)}
					aria-label="Request URL"
					className={cn(FIELD_TEXT_CLASSES, "relative z-10 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none")}
				/>

				<div aria-hidden className={cn(FIELD_TEXT_CLASSES, "invisible absolute inset-0 z-0 whitespace-pre")}>
					{tokens.map((token, index) =>
						token.type === "variable" ? (
							<span
								key={index}
								ref={el => {
									if (el) tokenElsRef.current.set(index, el);
									else tokenElsRef.current.delete(index);
								}}
							>
								{token.text}
							</span>
						) : (
							token.text
						),
					)}
				</div>
			</div>

			{error && <p className="mt-1 text-xs text-destructive">{error}</p>}

			{hover && (
				<VariableHoverCard
					name={hover.name}
					resolved={hoveredVariable}
					rect={hover.rect}
					onPointerEnter={cancelClose}
					onPointerLeave={scheduleClose}
					onRequestClose={() => setHover(null)}
					onSave={newValue => {
						if (hoveredVariable) onUpdateVariable(hoveredVariable, newValue);
						setHover(null);
					}}
					onCreate={() => {
						onCreateGlobalVariable(hover.name);
						setHover(null);
					}}
				/>
			)}
		</div>
	);
}
