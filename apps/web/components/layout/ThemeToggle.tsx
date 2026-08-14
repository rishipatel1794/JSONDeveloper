"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const base =
	"inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const [isLight, setIsLight] = useState(false);

	useEffect(() => {
		setMounted(true);
		setIsLight(document.documentElement.classList.contains("light"));
	}, []);

	function toggleTheme() {
		const next = !isLight;

		setIsLight(next);
		document.documentElement.classList.toggle("light", next);

		try {
			localStorage.setItem("theme", next ? "light" : "dark");
		} catch {
			// localStorage may be unavailable (private browsing) — theme just won't persist
		}
	}

	if (!mounted) {
		return <span className={base} aria-hidden="true" />;
	}

	return (
		<button type="button" onClick={toggleTheme} className={base} aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}>
			{isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
		</button>
	);
}
