import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "dotenv";

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(appDir));

const envCandidates = [
  join(appDir, ".env.local"),
  join(appDir, ".env"),
  join(repoRoot, ".env.local"),
  join(repoRoot, ".env"),
];

const mergedEnv = {};
for (const envPath of envCandidates) {
  if (!existsSync(envPath)) continue;
  const parsed = parse(readFileSync(envPath, "utf8"));
  Object.assign(mergedEnv, parsed);
}

const runtimeConfig = {
  NEXT_PUBLIC_API_URL: mergedEnv.NEXT_PUBLIC_API_URL ?? "",
};

const outputPath = join(appDir, "public", "runtime-config.json");
writeFileSync(outputPath, `${JSON.stringify(runtimeConfig, null, 2)}\n`, "utf8");

console.log(`Runtime config written: ${outputPath}`);
console.log(`NEXT_PUBLIC_API_URL=${runtimeConfig.NEXT_PUBLIC_API_URL || "<empty>"}`);
