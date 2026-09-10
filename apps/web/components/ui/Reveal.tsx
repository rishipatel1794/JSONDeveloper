"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
	children: ReactNode;
	/** Stagger delay in ms — pass `index * 60` from a `.map()` for a cascading grid entrance. */
	delay?: number;
	className?: string;
}

/**
 * Fades + lifts content in the first time it scrolls into view. Content is present in the initial
 * HTML either way (this only animates opacity/transform), so it doesn't affect what search engines
 * or no-JS clients can read — it just never finishes the transition without JS.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				const entry = entries[0];
				if (entry?.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
			className={cn("transition-all duration-700 ease-out", visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0", className)}
		>
			{children}
		</div>
	);
}
