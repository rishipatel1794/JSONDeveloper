"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface CopyButtonProps {
	value: string;
	label?: string;
	className?: string;
	disabled?: boolean;
	ariaLabel?: string;
}

export function CopyButton({ value, label = "Copy", className, disabled, ariaLabel }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	async function handleCopy() {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setCopied(false), 1500);
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			disabled={disabled || !value}
			aria-label={ariaLabel}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
				copied && "border-success-border text-success",
				className,
			)}
		>
			{copied ? (
				<>
					<Check className="size-3.5" /> Copied
				</>
			) : (
				<>
					<Copy className="size-3.5" /> {label}
				</>
			)}
		</button>
	);
}
