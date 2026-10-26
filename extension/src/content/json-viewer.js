// Classic (non-module) content script — intentionally duplicates a few small constants from
// shared/constants.js rather than importing it, since manifest-registered content scripts have
// inconsistent static ES-module support across Chrome versions. Keep these in sync with that file.
(async function () {
	"use strict";

	const MAX_RENDER_BYTES = 8 * 1024 * 1024;
	const PREFERENCES_KEY = "preferences";
	const LONG_STRING_PREVIEW_LENGTH = 80;

	const DEFAULT_PREFERENCES = {
		autoFormat: true,
		theme: "midnight-teal",
		fontSize: "medium",
		fontFamily: "default-mono",
	};

	const THEMES = [
		{ id: "midnight-teal", label: "Midnight Teal" },
		{ id: "light-clean", label: "Light Clean" },
		{ id: "vscode-dark", label: "VS Code Dark" },
		{ id: "dracula", label: "Dracula" },
		{ id: "high-contrast", label: "High Contrast" },
	];

	const FONT_SIZES = [
		{ id: "small", label: "Small", px: 12 },
		{ id: "medium", label: "Medium", px: 13 },
		{ id: "large", label: "Large", px: 15 },
	];

	const FONT_FAMILIES = [
		{
			id: "default-mono",
			label: "JetBrains Mono",
			stack: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
		},
		{
			id: "system-mono",
			label: "System Monospace",
			stack: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
		},
		{
			id: "fira-code",
			label: "Fira Code",
			stack: "'Fira Code', 'Cascadia Code', Consolas, monospace",
		},
		{
			id: "cascadia-code",
			label: "Cascadia Code",
			stack: "'Cascadia Code', 'Cascadia Mono', Consolas, monospace",
		},
		{
			id: "source-code-pro",
			label: "Source Code Pro",
			stack: "'Source Code Pro', 'Courier New', monospace",
		},
		{
			id: "ibm-plex-mono",
			label: "IBM Plex Mono",
			stack: "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
		},
		{
			id: "inconsolata",
			label: "Inconsolata",
			stack: "Inconsolata, 'Courier New', monospace",
		},
		{
			id: "roboto-mono",
			label: "Roboto Mono",
			stack: "'Roboto Mono', 'SFMono-Regular', Consolas, monospace",
		},
		{
			id: "ubuntu-mono",
			label: "Ubuntu Mono",
			stack: "'Ubuntu Mono', 'DejaVu Sans Mono', monospace",
		},
		{
			id: "anonymous-pro",
			label: "Anonymous Pro",
			stack: "'Anonymous Pro', 'Courier New', monospace",
		},
		{
			id: "dejavu-sans-mono",
			label: "DejaVu Sans Mono",
			stack: "'DejaVu Sans Mono', 'Liberation Mono', monospace",
		},
		{
			id: "lucida-console",
			label: "Lucida Console",
			stack: "'Lucida Console', Monaco, monospace",
		},
		{
			id: "courier-prime",
			label: "Courier Prime",
			stack: "'Courier Prime', 'Courier New', monospace",
		},
		{
			id: "monaco",
			label: "Monaco",
			stack: "Monaco, 'SFMono-Regular', Consolas, monospace",
		},
		{
			id: "courier-new",
			label: "Courier New",
			stack: "'Courier New', Courier, monospace",
		},
	];

	// Bail out immediately for anything that isn't a bare JSON document — this is the entire safety
	// boundary that keeps this script from ever touching a normal HTML page. Chrome only sets this
	// content type when the navigation's response itself was served as JSON, not embedded in HTML.
	if (document.contentType !== "application/json") return;

	const rawText = document.body ? document.body.innerText : "";
	if (!rawText || rawText.length > MAX_RENDER_BYTES) return;

	let parsed;
	try {
		parsed = JSON.parse(rawText);
	} catch {
		// Content-Type said JSON but the body doesn't actually parse — leave Chrome's default view
		// alone rather than replacing a page we can't usefully render.
		return;
	}

	const preferences = await loadPreferences();
	if (preferences.autoFormat === false) return; // explicitly disabled in the popup — defaults to on when unset

	chrome.runtime.sendMessage({ type: "JSON_PAGE_DETECTED" });
	window.addEventListener("pagehide", () => chrome.runtime.sendMessage({ type: "JSON_PAGE_CLEARED" }), { once: true });

	renderViewer(parsed, rawText, preferences);

	/** Reads preferences via sync, falling back to local storage if sync is unavailable/rejects. */
	async function loadPreferences() {
		try {
			const stored = await chrome.storage.sync.get(PREFERENCES_KEY);
			return { ...DEFAULT_PREFERENCES, ...stored[PREFERENCES_KEY] };
		} catch {
			const stored = await chrome.storage.local.get(PREFERENCES_KEY);
			return { ...DEFAULT_PREFERENCES, ...stored[PREFERENCES_KEY] };
		}
	}

	async function savePreferences(partial, current) {
		const next = { ...current, ...partial };
		try {
			await chrome.storage.sync.set({ [PREFERENCES_KEY]: next });
		} catch {
			await chrome.storage.local.set({ [PREFERENCES_KEY]: next });
		}
		return next;
	}

	function valueTypeOf(value) {
		if (value === null) return "null";
		if (Array.isArray(value)) return "array";
		return typeof value;
	}

	function previewFor(value) {
		const type = valueTypeOf(value);
		if (type === "object") return `{${Object.keys(value).length}}`;
		if (type === "array") return `[${value.length}]`;
		if (type === "string") return JSON.stringify(value);
		return String(value);
	}

	/** Builds the collapsible tree as real DOM nodes (not innerHTML of untrusted content) so nothing from the JSON is ever interpreted as markup. */
	function buildTreeNode(key, value, depth, registry) {
		const row = document.createElement("div");
		row.className = "jd-row";
		row.style.paddingLeft = `${depth * 18}px`;
		row.tabIndex = 0;
		row.setAttribute("role", "treeitem");

		const type = valueTypeOf(value);
		const hasChildren = (type === "object" && Object.keys(value).length > 0) || (type === "array" && value.length > 0);

		const toggle = document.createElement("span");
		toggle.className = "jd-toggle";
		toggle.textContent = hasChildren ? "▾" : " ";

		const keySpan = document.createElement("span");
		keySpan.className = "jd-key";
		keySpan.textContent = key !== null ? `${key}: ` : "";

		const valueSpan = document.createElement("span");
		valueSpan.className = `jd-value jd-${type}`;

		const isLongString = type === "string" && value.length > LONG_STRING_PREVIEW_LENGTH;
		if (isLongString) {
			let expanded = false;
			const shortText = JSON.stringify(`${value.slice(0, LONG_STRING_PREVIEW_LENGTH)}…`);
			const fullText = JSON.stringify(value);
			valueSpan.textContent = shortText;

			const expandBtn = document.createElement("button");
			expandBtn.type = "button";
			expandBtn.className = "jd-string-toggle";
			expandBtn.textContent = "show more";
			expandBtn.addEventListener("click", event => {
				event.stopPropagation();
				expanded = !expanded;
				valueSpan.textContent = expanded ? fullText : shortText;
				expandBtn.textContent = expanded ? "show less" : "show more";
			});

			row.append(toggle, keySpan, valueSpan, expandBtn);
		} else {
			valueSpan.textContent = previewFor(value);
			row.append(toggle, keySpan, valueSpan);
		}

		const childContainer = document.createElement("div");
		childContainer.className = "jd-children";
		childContainer.setAttribute("role", "group");

		if (hasChildren) {
			row.setAttribute("aria-expanded", "true");
			const entries = type === "array" ? value.map((item, index) => [index, item]) : Object.entries(value);
			for (const [childKey, childValue] of entries) {
				childContainer.appendChild(buildTreeNode(childKey, childValue, depth + 1, registry));
			}

			const setExpanded = expand => {
				childContainer.classList.toggle("jd-collapsed", !expand);
				toggle.textContent = expand ? "▾" : "▸";
				row.setAttribute("aria-expanded", String(expand));
			};

			toggle.addEventListener("click", event => {
				event.stopPropagation();
				setExpanded(childContainer.classList.contains("jd-collapsed"));
			});

			registry.push({ setExpanded, hasChildren: true });
		} else {
			registry.push({ hasChildren: false });
		}

		row.addEventListener("click", () => selectRow(row));

		row.addEventListener("keydown", event => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				if (hasChildren) toggle.click();
				selectRow(row);
			} else if (event.key === "ArrowRight" && hasChildren && childContainer.classList.contains("jd-collapsed")) {
				toggle.click();
			} else if (event.key === "ArrowLeft" && hasChildren && !childContainer.classList.contains("jd-collapsed")) {
				toggle.click();
			} else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				moveFocus(row, event.key === "ArrowDown" ? 1 : -1);
			}
		});

		const wrapper = document.createElement("div");
		wrapper.append(row, childContainer);
		return wrapper;
	}

	function selectRow(row) {
		const tree = row.closest(".jd-tree");
		if (!tree) return;
		for (const el of tree.querySelectorAll(".jd-row.jd-selected")) el.classList.remove("jd-selected");
		row.classList.add("jd-selected");
	}

	function moveFocus(fromRow, direction) {
		const tree = fromRow.closest(".jd-tree");
		if (!tree) return;
		const rows = [...tree.querySelectorAll(".jd-row")].filter(el => el.offsetParent !== null);
		const index = rows.indexOf(fromRow);
		const next = rows[index + direction];
		if (next) next.focus();
	}

	function applyTheme(root, prefs) {
		root.dataset.jdTheme = THEMES.some(t => t.id === prefs.theme) ? prefs.theme : "midnight-teal";
		const fontSize = FONT_SIZES.find(f => f.id === prefs.fontSize) ?? FONT_SIZES[1];
		const fontFamily = FONT_FAMILIES.find(f => f.id === prefs.fontFamily) ?? FONT_FAMILIES[0];
		root.style.setProperty("--jd-font-size", `${fontSize.px}px`);
		root.style.setProperty("--jd-font-family", fontFamily.stack);
	}

	function renderViewer(value, raw, initialPreferences) {
		let preferences = initialPreferences;
		const formatted = JSON.stringify(value, null, 2);
		const registry = [];

		const root = document.createElement("div");
		root.id = "jd-json-viewer-root";
		applyTheme(root, preferences);

		const toolbar = document.createElement("div");
		toolbar.className = "jd-toolbar";

		const brand = document.createElement("span");
		brand.className = "jd-brand";
		brand.textContent = "JSONDeveloper";

		const modeToggle = document.createElement("div");
		modeToggle.className = "jd-mode-toggle";
		const treeBtn = button("Tree", true);
		const rawBtn = button("Raw", false);
		modeToggle.append(treeBtn, rawBtn);

		const expandAllBtn = button("Expand All", false);
		const collapseAllBtn = button("Collapse All", false);
		const viewGroup = document.createElement("div");
		viewGroup.className = "jd-group";
		viewGroup.append(expandAllBtn, collapseAllBtn);

		const spacer = document.createElement("div");
		spacer.className = "jd-spacer";

		const copyBtn = button("Copy", false);
		const downloadBtn = button("Download", false);

		const { wrap: settingsWrap } = buildSettingsPanel();

		const openBtn = button("Open in JSONDeveloper", false);
		openBtn.classList.add("jd-primary");

		toolbar.append(brand, modeToggle, viewGroup, spacer, copyBtn, downloadBtn, settingsWrap, openBtn);

		const content = document.createElement("div");
		content.className = "jd-content";

		const treeView = document.createElement("div");
		treeView.className = "jd-tree";
		treeView.setAttribute("role", "tree");

		const isEmptyRoot =
			(valueTypeOf(value) === "object" && Object.keys(value).length === 0) || (valueTypeOf(value) === "array" && value.length === 0);
		if (isEmptyRoot) {
			const empty = document.createElement("div");
			empty.className = "jd-empty-state";
			empty.textContent = valueTypeOf(value) === "array" ? "Empty array []" : "Empty object {}";
			treeView.appendChild(empty);
		} else {
			treeView.appendChild(buildTreeNode(null, value, 0, registry));
		}

		const rawView = document.createElement("pre");
		rawView.className = "jd-raw";
		rawView.textContent = formatted;
		rawView.style.display = "none";

		content.append(treeView, rawView);
		root.append(toolbar, content);

		document.body.innerHTML = "";
		document.body.appendChild(root);
		document.title = `{ } JSON — ${document.title || location.pathname}`;

		treeBtn.addEventListener("click", () => setMode(true));
		rawBtn.addEventListener("click", () => setMode(false));

		function setMode(showTree) {
			treeView.style.display = showTree ? "" : "none";
			rawView.style.display = showTree ? "none" : "";
			treeBtn.classList.toggle("jd-active", showTree);
			rawBtn.classList.toggle("jd-active", !showTree);
		}

		expandAllBtn.addEventListener("click", () => {
			for (const entry of registry) if (entry.hasChildren) entry.setExpanded(true);
		});

		collapseAllBtn.addEventListener("click", () => {
			for (const entry of registry) if (entry.hasChildren) entry.setExpanded(false);
		});

		copyBtn.addEventListener("click", async () => {
			try {
				await navigator.clipboard.writeText(formatted);
				flash(copyBtn, "Copied!");
			} catch {
				flash(copyBtn, "Copy failed", true);
			}
		});

		downloadBtn.addEventListener("click", () => {
			const blob = new Blob([formatted], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "response.json";
			link.click();
			URL.revokeObjectURL(url);
		});

		openBtn.addEventListener("click", () => {
			chrome.runtime.sendMessage({ type: "OPEN_IN_EDITOR", json: raw, sourceUrl: location.href }, response => {
				if (response && response.success === false) flash(openBtn, response.error, true);
			});
		});

		function button(label, active) {
			const el = document.createElement("button");
			el.type = "button";
			el.textContent = label;
			el.className = "jd-btn" + (active ? " jd-active" : "");
			return el;
		}

		function flash(el, text, isError) {
			const original = el.textContent;
			el.textContent = text;
			if (isError) el.classList.add("jd-error-flash");
			setTimeout(() => {
				el.textContent = original;
				el.classList.remove("jd-error-flash");
			}, 1800);
		}

		function buildSettingsPanel() {
			const wrap = document.createElement("div");
			wrap.className = "jd-settings-wrap";

			const gearBtn = button("Settings", false);
			gearBtn.setAttribute("aria-haspopup", "true");
			gearBtn.setAttribute("aria-expanded", "false");

			const panel = document.createElement("div");
			panel.className = "jd-settings-panel";
			panel.hidden = true;

			const themeRow = selectRowEl("Theme", THEMES, preferences.theme, async id => {
				preferences = await savePreferences({ theme: id }, preferences);
				applyTheme(root, preferences);
			});

			const fontSizeRow = selectRowEl("Font size", FONT_SIZES, preferences.fontSize, async id => {
				preferences = await savePreferences({ fontSize: id }, preferences);
				applyTheme(root, preferences);
			});

			const fontFamilyRow = selectRowEl("Font family", FONT_FAMILIES, preferences.fontFamily, async id => {
				preferences = await savePreferences({ fontFamily: id }, preferences);
				applyTheme(root, preferences);
			});

			panel.append(themeRow, fontSizeRow, fontFamilyRow);

			gearBtn.addEventListener("click", event => {
				event.stopPropagation();
				const show = panel.hidden;
				panel.hidden = !show;
				gearBtn.setAttribute("aria-expanded", String(show));
			});

			document.addEventListener("click", event => {
				if (!wrap.contains(event.target)) {
					panel.hidden = true;
					gearBtn.setAttribute("aria-expanded", "false");
				}
			});

			wrap.append(gearBtn, panel);
			return { wrap, panel, button: gearBtn };
		}

		function selectRowEl(label, options, selectedId, onChange) {
			const row = document.createElement("label");
			row.className = "jd-settings-row";

			const text = document.createElement("span");
			text.textContent = label;

			const select = document.createElement("select");
			for (const option of options) {
				const optionEl = document.createElement("option");
				optionEl.value = option.id;
				optionEl.textContent = option.label;
				optionEl.selected = option.id === selectedId;
				select.appendChild(optionEl);
			}
			select.addEventListener("change", () => onChange(select.value));

			row.append(text, select);
			return row;
		}
	}
})();
