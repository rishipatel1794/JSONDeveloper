# JSONDeveloper Chrome Extension

A Manifest V3 Chrome extension that automatically formats raw JSON API responses into a readable,
collapsible tree view, and hands data off to the [JSONDeveloper](https://jsondeveloper.com) web
editor with one click.

This is a standalone project inside the JSONDeveloper monorepo — it is **not** part of the
`apps/web` pnpm workspace or its build, and has its own `package.json` and `node_modules` so the
website's build is never affected by anything here (and vice versa).

## Structure

```
extension/
  manifest.json              Manifest V3 definition
  icons/                     16/32/48/128px extension icons
  src/
    background/
      background.js          Service worker — message validation, badge, editor hand-off
    content/
      json-viewer.js          Detects a raw JSON response and renders the formatted viewer
      json-viewer.css          Its styling
      editor-bridge.js         Runs only on jsondeveloper.com/visualizer — delivers a pending
                                 transfer from chrome.storage into the page
    popup/
      popup.html / .js / .css  The toolbar popup
    shared/
      constants.js             Shared config (used by background.js and popup.js, which both
                                 support ES modules; the two content scripts duplicate the couple
                                 of constants they need — see the comment at the top of each)
  test/                        node:test + jsdom tests for the content scripts
```

## How it works

### Automatic JSON formatting

`json-viewer.js` is injected into every page (`matches: ["http://*/*", "https://*/*"]`), but it
checks `document.contentType === "application/json"` as its very first line and returns
immediately for anything else — this is the same technique used by other well-known JSON-formatter
extensions, and it means the script does nothing measurable on a normal HTML page. Chrome only sets
that content type when a navigation's response was served as a bare JSON document (an API endpoint
hit directly, a `.json` file, etc.), not when JSON is embedded in or fetched by an HTML page.

If the content type matches, the raw text is parsed with `JSON.parse` (never `eval`, never
`innerHTML` of the raw text) and rendered as real DOM nodes via `textContent` — nothing from the
JSON response is ever interpreted as HTML or executed as script. If parsing fails despite the
content type, the script leaves Chrome's default view alone rather than guessing.

### One-click editor integration

Clicking "Open in JSONDeveloper" (in the formatted viewer or the popup's file-open flow) does **not**
put the JSON in a URL or browser history. Instead:

1. The JSON is written to `chrome.storage.local` with a timestamp, and a new tab opens to
   `jsondeveloper.com/visualizer?from=extension` (just a flag in the URL — never the data itself).
2. `editor-bridge.js`, which only runs on that exact URL, reads the pending transfer, discards it
   if it's older than 60 seconds, and immediately deletes it from storage either way (single-use).
3. If still valid, it `postMessage`s the payload into the page, scoped to the page's own origin.
4. The website's own code (`apps/web/components/tools/json-visualizer/JsonVisualizer.tsx`) listens
   for that specific message shape and loads it into the editor — see
   `apps/web/lib/tools/json-visualizer/extensionBridge.ts` for the validation logic.

A payload larger than 2MB is rejected with a clear message rather than silently failing.

## Typography and themes

The formatted JSON viewer (`json-viewer.js` / `json-viewer.css`) ships five themes, a font-size
setting, and a font-family setting, all driven by CSS custom properties on `#jd-json-viewer-root`
so no rule is duplicated per theme:

| Token | Purpose |
|---|---|
| `--background` | Page background |
| `--surface` | Toolbar / panel background |
| `--surface-hover` | Hover background for rows, buttons, panels |
| `--border` | Borders and the per-level indentation guide |
| `--text-primary` | Default text color |
| `--text-secondary` | Muted text (toggle arrows, brackets/metadata, labels) |
| `--key-color` | Object/array key color |
| `--string-color` | String value color |
| `--number-color` | Number value color |
| `--boolean-color` | Boolean value color |
| `--null-color` | `null` value color |
| `--accent-color` / `--accent-contrast` | Brand accent and its readable foreground |
| `--error-color` | Copy/transfer failure feedback |

Themes: **Midnight Teal** (default), **Light Clean**, **VS Code Dark**, **Dracula**, **High
Contrast**. Switch themes from the gear icon in the viewer's toolbar, or from the popup — both
read/write the same `chrome.storage.sync` preference (falling back to `chrome.storage.local` if
sync throws, e.g. when Chrome Sync is disabled), so the choice persists across tabs and survives
reopening the browser. A JSON page applies the stored theme before the viewer is first painted, so
there's no visible flash of the default theme.

**On "bundled" fonts**: the Font Family setting offers a default stack that prefers JetBrains Mono
or IBM Plex Mono if you already have either installed, falling back to a reliable system monospace
font, plus a "System Monospace" option. Actual webfont files are **not** vendored in this change —
there was no reliable way to fetch and license-verify font binaries in the environment this was
built in. If you want true bundled fonts, drop licensed `.woff2` files under a new
`extension/src/content/fonts/` folder, `@font-face`-declare them in `json-viewer.css`, and add them
to `FONT_FAMILIES` in `shared/constants.js` (and its duplicate list in `json-viewer.js`).

No color alone communicates meaning: strings keep their JSON quote marks, booleans and `null` show
their literal text (`null` is additionally italicized), keys are bold, and clipboard/transfer
errors always replace the button's own text (e.g. "Copy failed") rather than relying on red alone.

## Permissions — and why

| Permission | Reason |
|---|---|
| `storage` | Remembers your auto-format/theme preference, and briefly holds a JSON payload during an editor hand-off. |
| `activeTab` | Lets the popup act on the tab you're viewing without requesting access to every open tab. |
| `host_permissions: https://jsondeveloper.com/*` | The *only* site the editor-bridge content script is allowed to run on. No other website is granted any access. |

The JSON-detector content script itself needs no special host permission beyond the standard
`content_scripts.matches` declaration — it never calls a privileged API against the page it runs on.

## Privacy

- No JSON content is ever sent to a server (not even jsondeveloper.com's own server — the hand-off
  goes directly into the browser tab via `postMessage`).
- No browsing history is collected or read.
- `document.contentType` is the only signal used to detect JSON pages — no network interception.
- Nothing from a JSON response is ever executed as script or rendered as HTML.

## Build instructions

There is no bundler or build step — the extension runs its source files directly, which is also
why Chrome's Web Store review can read every line of shipped code as-is.

```sh
cd extension
npm install   # only needed to run the test suite (installs jsdom)
npm test      # runs the content-script tests under Node's built-in test runner
```

## Loading the unpacked extension in Chrome

1. Open `chrome://extensions` in Chrome (or any Chromium-based browser).
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select this `extension/` folder.
4. The JSONDeveloper icon appears in the toolbar.

Chrome reloads the unpacked extension automatically on most file changes; for changes to
`manifest.json` itself, click the refresh icon on the extension's card in `chrome://extensions`.

## Testing JSON response pages

Any URL that returns a bare JSON document should trigger the formatted viewer. A few ways to try it:

- Open a public API endpoint directly in a tab, e.g. `https://api.github.com/repos/vercel/next.js`.
- Open any local `.json` file via `file://` (you'll need to enable "Allow access to file URLs" for
  this extension in `chrome://extensions` first, since Chrome blocks that by default).
- Confirm a normal HTML page (e.g. `https://jsondeveloper.com`) is completely unaffected.
- Confirm a page serving malformed JSON with a `application/json` content type is left as Chrome's
  default view rather than a broken formatted one.
- Open the toolbar's gear icon and cycle through all five themes, both font-size options, and both
  font-family options, in both Tree and Raw view — confirm every part of the UI (toolbar, buttons,
  tree, selected-row highlight, indentation guides) restyles, not just the background.
- Reopen the same JSON URL (or a different one) after changing a preference and confirm it's
  restored automatically, with no flash of the previous theme.
- Click a row to select it, confirm only one row is highlighted at a time, then tab through rows
  with the keyboard and confirm focus is visible and Enter/→/← expand, collapse, and select.
- Open a response with a long string field and confirm it's truncated with a "show more" toggle,
  and that Raw view / "Open in JSONDeveloper" still carry the untruncated value.
- Try `{}` and `[]` responses and confirm a plain "Empty object"/"Empty array" message renders
  instead of an empty tree.
- Zoom the page in/out (Ctrl/Cmd +/-) and resize the window narrow to confirm the toolbar wraps and
  stays usable instead of overflowing.

To test the editor hand-off: on a detected JSON page, click **Open in JSONDeveloper** and confirm a
new tab opens directly to the Visualizer with the data already loaded — not via a URL parameter
(check the address bar only shows `?from=extension`).

To test preferences: open the popup, turn off "Auto-format JSON pages", reload a JSON URL, and
confirm Chrome's default (unformatted) view is shown instead.

## Chrome Web Store preparation

Not yet published. Before submitting:

1. Bump `"version"` in `manifest.json` following semver.
2. Prepare store listing assets: a 128×128 icon (already in `icons/icon128.png`), at least one
   1280×800 or 640×400 screenshot of the formatted viewer and the popup, and a short + detailed
   description (the feature list in this README is a good starting point).
3. Fill out the Chrome Web Store's required privacy practices disclosure — per the Privacy section
   above, this extension does not collect or transmit user data, which should be declared accurately
   in the "Single Purpose" and "Permission justification" fields reviewers check explicitly.
4. Zip the `extension/` folder's contents (not the folder itself) and upload via the
   [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
5. Replace the "Get the source on GitHub" link on `jsondeveloper.com/extension` with the published
   Chrome Web Store listing URL once approved.
