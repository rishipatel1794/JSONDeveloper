/**
 * Source of truth for the Web Worker that runs regex matching in isolation. Not bundled directly by
 * Next.js — `scripts/build-workers.mjs` pre-compiles this into `public/workers/regex-match.worker.js`
 * (run via the `prebuild`/`predev` hooks), which `useSafeRegexMatch` loads via a plain string URL. See
 * that script's own comment for why.
 */
import { testRegex } from "@/lib/tools/regex/tester";
import type { RegexTestResult } from "@/lib/tools/regex/types";

export interface RegexWorkerRequest {
	id: number;
	pattern: string;
	flags: string;
	testString: string;
}

export interface RegexWorkerResponse {
	id: number;
	result: RegexTestResult;
}

/**
 * Retyped locally rather than pulling in the "webworker" lib — this app's tsconfig targets "DOM" for
 * the browser's own `Window.postMessage`, and the two overlapping-but-different global `self` shapes
 * can't both be satisfied project-wide. This file only ever touches `onmessage`/`postMessage`.
 */
interface WorkerGlobalScope {
	onmessage: ((event: MessageEvent<RegexWorkerRequest>) => void) | null;
	postMessage: (message: RegexWorkerResponse) => void;
}

const workerScope = self as unknown as WorkerGlobalScope;

workerScope.onmessage = event => {
	const { id, pattern, flags, testString } = event.data;
	const result = testRegex(pattern, flags, testString);
	workerScope.postMessage({ id, result });
};
