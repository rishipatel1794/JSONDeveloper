"use client";

import { useEffect, useState } from "react";
import { loader } from "@monaco-editor/react";

let monacoPromise: ReturnType<typeof loader.init> | null = null;

function getMonaco() {
	monacoPromise ??= loader.init();
	return monacoPromise;
}

function useEditorThemeName(): "vs" | "vs-dark" {
	const [theme, setTheme] = useState<"vs" | "vs-dark">("vs-dark");

	useEffect(() => {
		function updateThemeFromRootClass() {
			setTheme(document.documentElement.classList.contains("light") ? "vs" : "vs-dark");
		}

		updateThemeFromRootClass();

		const observer = new MutationObserver(updateThemeFromRootClass);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

		return () => observer.disconnect();
	}, []);

	return theme;
}

/**
 * Syntax-highlights `text` line-by-line using Monaco's standalone colorizer (no editor instance
 * mounted) so the diff view can reuse the app's existing Monaco dependency instead of a second
 * highlighting library. Returns `null` while highlighting is unavailable — callers should fall
 * back to plain text rather than block rendering on it.
 */
export function useHighlightedLines(text: string, monacoLanguage: string): string[] | null {
	const theme = useEditorThemeName();
	const [lines, setLines] = useState<string[] | null>(null);

	useEffect(() => {
		let cancelled = false;

		if (!text) {
			setLines([]);
			return;
		}

		setLines(null);

		getMonaco()
			.then(async monaco => {
				if (cancelled) return;
				monaco.editor.setTheme(theme);

				const html = await monaco.editor.colorize(text, monacoLanguage, { tabSize: 2 });
				if (cancelled) return;

				const expectedLineCount = text.split("\n").length;
				const htmlLines = html.split("<br/>");

				// Defensive: if the colorizer's line count doesn't match the source, don't risk
				// misaligning highlighted HTML with diff rows — let the caller fall back to plain text.
				if (htmlLines.length !== expectedLineCount) {
					setLines(null);
					return;
				}

				setLines(htmlLines);
			})
			.catch(() => {
				if (!cancelled) setLines(null);
			});

		return () => {
			cancelled = true;
		};
	}, [text, monacoLanguage, theme]);

	return lines;
}
