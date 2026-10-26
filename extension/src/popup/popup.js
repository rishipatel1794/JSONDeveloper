import { FONT_FAMILIES, FONT_SIZES, STORAGE_KEYS, THEMES, VISUALIZER_URL, WEBSITE_ORIGIN, loadPreferences, savePreferences } from "../shared/constants.js";

const openEditorBtn = document.getElementById("open-editor");
const openVisualizerBtn = document.getElementById("open-visualizer");
const formatClipboardBtn = document.getElementById("format-clipboard");
const openFileInput = document.getElementById("open-file");
const resultEl = document.getElementById("format-result");
const autoFormatToggle = document.getElementById("auto-format-toggle");
const themeSelect = document.getElementById("theme-select");
const fontSizeSelect = document.getElementById("font-size-select");
const fontFamilySelect = document.getElementById("font-family-select");

openEditorBtn.addEventListener("click", () => chrome.tabs.create({ url: WEBSITE_ORIGIN }));
openVisualizerBtn.addEventListener("click", () => chrome.tabs.create({ url: VISUALIZER_URL }));

formatClipboardBtn.addEventListener("click", async () => {
	try {
		const text = await navigator.clipboard.readText();
		const parsed = JSON.parse(text);
		const formatted = JSON.stringify(parsed, null, 2);
		await navigator.clipboard.writeText(formatted);
		showResult(`Formatted ${formatted.length.toLocaleString()} characters back to your clipboard.`, false);
	} catch {
		showResult("Clipboard contents aren't valid JSON.", true);
	}
});

openFileInput.addEventListener("change", async () => {
	const file = openFileInput.files?.[0];
	openFileInput.value = "";
	if (!file) return;

	try {
		const text = await file.text();
		JSON.parse(text); // validate before transferring
		await chrome.storage.local.set({
			[STORAGE_KEYS.PENDING_TRANSFER]: { json: text, sourceUrl: file.name, createdAt: Date.now() },
		});
		await chrome.tabs.create({ url: `${VISUALIZER_URL}?from=extension` });
		window.close();
	} catch {
		showResult(`"${file.name}" isn't valid JSON.`, true);
	}
});

function showResult(message, isError) {
	resultEl.textContent = message;
	resultEl.hidden = false;
	resultEl.classList.toggle("jd-error", Boolean(isError));
}

function populateSelect(selectEl, options, selectedId) {
	selectEl.innerHTML = "";
	for (const option of options) {
		const optionEl = document.createElement("option");
		optionEl.value = option.id;
		optionEl.textContent = option.label;
		optionEl.selected = option.id === selectedId;
		selectEl.appendChild(optionEl);
	}
}

async function init() {
	const preferences = await loadPreferences();
	autoFormatToggle.checked = preferences.autoFormat;
	populateSelect(themeSelect, THEMES, preferences.theme);
	populateSelect(fontSizeSelect, FONT_SIZES, preferences.fontSize);
	populateSelect(fontFamilySelect, FONT_FAMILIES, preferences.fontFamily);
}

autoFormatToggle.addEventListener("change", () => savePreferences({ autoFormat: autoFormatToggle.checked }));
themeSelect.addEventListener("change", () => savePreferences({ theme: themeSelect.value }));
fontSizeSelect.addEventListener("change", () => savePreferences({ fontSize: fontSizeSelect.value }));
fontFamilySelect.addEventListener("change", () => savePreferences({ fontFamily: fontFamilySelect.value }));

void init();
