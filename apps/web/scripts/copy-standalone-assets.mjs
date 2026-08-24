// `output: "standalone"` (see next.config.js) produces a self-contained server, but Next.js
// deliberately does not copy static assets into it — the docs call this out as a required manual
// step (https://nextjs.org/docs/app/api-reference/config/next-config-js/output). In a monorepo the
// standalone folder is nested under the app's own workspace path, so this script locates it rather
// than hardcoding one. Runs automatically via the `postbuild` script.
import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const standaloneAppDir = join(appDir, ".next", "standalone", "apps", "web");

if (!existsSync(standaloneAppDir)) {
	console.log('No standalone output found — skipping static asset copy (this is expected unless next.config.js sets output: "standalone").');
} else {
	const staticSrc = join(appDir, ".next", "static");
	const staticDest = join(standaloneAppDir, ".next", "static");
	if (existsSync(staticSrc)) {
		cpSync(staticSrc, staticDest, { recursive: true });
		console.log(`Copied .next/static -> ${staticDest}`);
	}

	const publicSrc = join(appDir, "public");
	const publicDest = join(standaloneAppDir, "public");
	if (existsSync(publicSrc)) {
		cpSync(publicSrc, publicDest, { recursive: true });
		console.log(`Copied public/ -> ${publicDest}`);
	}
}
