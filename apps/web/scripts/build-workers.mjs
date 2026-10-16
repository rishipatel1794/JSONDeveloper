/**
 * Pre-compiles Web Worker entry points to plain, self-contained JS files in `public/workers/`,
 * referenced at runtime via a plain string URL (`new Worker("/workers/<name>.js")`).
 *
 * This exists because Next.js's Turbopack (used for this app's static-export build) does not bundle
 * the standard webpack-style `new Worker(new URL("./file.ts", import.meta.url))` pattern — it copies
 * the raw, unprocessed TypeScript source into the output as a generic static asset instead of compiling
 * it, which would fail immediately at runtime. Pre-building with esbuild sidesteps that entirely.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(appDir, "public", "workers");

const entries = [{ entry: "lib/tools/regex-shared/regex-match.worker.ts", outfile: "regex-match.worker.js" }];

mkdirSync(outDir, { recursive: true });

for (const { entry, outfile } of entries) {
	await esbuild.build({
		entryPoints: [join(appDir, entry)],
		outfile: join(outDir, outfile),
		bundle: true,
		minify: true,
		format: "iife",
		platform: "browser",
		target: "es2020",
		tsconfig: join(appDir, "tsconfig.json"),
		logLevel: "info",
	});
}

// Sanity check: fail the build loudly if the output doesn't look like real compiled JS.
for (const { outfile } of entries) {
	const content = readFileSync(join(outDir, outfile), "utf8");
	if (content.includes("import type") || content.length < 20) {
		throw new Error(`build-workers: ${outfile} does not look like a compiled bundle — aborting.`);
	}
}

console.log(`Built ${entries.length} worker bundle(s) into ${outDir}`);
