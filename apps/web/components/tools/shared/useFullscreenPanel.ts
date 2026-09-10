"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Body-scroll-lock + Escape-to-exit for any panel that can expand to fill the viewport.
 * Only one panel is ever fullscreen at a time in practice, so a simple local boolean (rather
 * than a global store) is enough — the scroll lock is released on unmount as a safety net too.
 */
export function useFullscreenPanel() {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const enter = useCallback(() => setIsFullscreen(true), []);
	const exit = useCallback(() => setIsFullscreen(false), []);
	const toggle = useCallback(() => setIsFullscreen(value => !value), []);

	useEffect(() => {
		if (!isFullscreen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") exit();
		}
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isFullscreen, exit]);

	return { isFullscreen, enter, exit, toggle };
}
