"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
	value: number;
	durationMs?: number;
}

/** Counts up from 0 to `value` once it scrolls into view — a small, purely decorative detail. */
export function CountUp({ value, durationMs = 600 }: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const [display, setDisplay] = useState(value);
	const hasAnimated = useRef(false);

	useEffect(() => {
		const node = ref.current;
		if (!node || hasAnimated.current) return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const observer = new IntersectionObserver(
			entries => {
				const entry = entries[0];
				if (!entry?.isIntersecting || hasAnimated.current) return;
				hasAnimated.current = true;
				observer.disconnect();

				setDisplay(0);
				const start = performance.now();

				function tick(now: number) {
					const progress = Math.min((now - start) / durationMs, 1);
					const eased = 1 - (1 - progress) ** 3;
					setDisplay(Math.round(eased * value));
					if (progress < 1) requestAnimationFrame(tick);
				}

				requestAnimationFrame(tick);
			},
			{ threshold: 0.4 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [value, durationMs]);

	return <span ref={ref}>{display}</span>;
}
