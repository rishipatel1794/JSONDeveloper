"use client";

import { useEffect, useState } from "react";

/** SSR-safe viewport width check — starts `false` (desktop) and corrects itself after mount. */
export function useIsNarrowViewport(breakpointPx = 1024): boolean {
	const [isNarrow, setIsNarrow] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
		setIsNarrow(query.matches);

		function handleChange(event: MediaQueryListEvent) {
			setIsNarrow(event.matches);
		}

		query.addEventListener("change", handleChange);
		return () => query.removeEventListener("change", handleChange);
	}, [breakpointPx]);

	return isNarrow;
}
