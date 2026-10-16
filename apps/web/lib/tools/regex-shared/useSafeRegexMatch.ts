"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { RegexTestResult } from "@/lib/tools/regex/types";

import { MATCH_TIMEOUT_MS, MAX_PATTERN_LENGTH, MAX_TEST_STRING_LENGTH } from "./limits";
import type { RegexWorkerRequest, RegexWorkerResponse } from "./regex-match.worker";

function tooLongResult(what: string, limit: number): RegexTestResult {
	return { success: false, matches: [], matchCount: 0, error: `${what} is too long (limit ${limit.toLocaleString()} characters).` };
}

function timeoutResult(): RegexTestResult {
	return {
		success: false,
		matches: [],
		matchCount: 0,
		error: `This pattern took longer than ${MATCH_TIMEOUT_MS}ms to evaluate and was stopped — it may cause catastrophic backtracking on this input. A synchronous JavaScript regex can't be safely interrupted in place, so the isolated worker running it was terminated instead.`,
	};
}

/**
 * Runs regex matching in a dedicated Web Worker so a catastrophically-backtracking pattern can be
 * forcibly stopped via `worker.terminate()` — the only real way to interrupt synchronous `RegExp` work,
 * since nothing in JavaScript can safely cancel a running synchronous call from the same thread.
 */
export function useSafeRegexMatch() {
	const workerRef = useRef<Worker | null>(null);
	const nextIdRef = useRef(0);
	const [isRunning, setIsRunning] = useState(false);

	function getWorker(): Worker {
		if (!workerRef.current) {
			// A plain string URL to a pre-built bundle (see scripts/build-workers.mjs), not the usual
			// `new Worker(new URL("./file.ts", import.meta.url))` pattern — this app's Turbopack static
			// export copies that file in as a raw, unbundled TS asset instead of compiling it, which
			// would fail at runtime. Pre-building sidesteps the bundler's worker handling entirely.
			workerRef.current = new Worker("/workers/regex-match.worker.js");
		}
		return workerRef.current;
	}

	const run = useCallback((pattern: string, flags: string, testString: string): Promise<RegexTestResult> => {
		if (pattern.length > MAX_PATTERN_LENGTH) {
			return Promise.resolve(tooLongResult("Pattern", MAX_PATTERN_LENGTH));
		}
		if (testString.length > MAX_TEST_STRING_LENGTH) {
			return Promise.resolve(tooLongResult("Test string", MAX_TEST_STRING_LENGTH));
		}

		return new Promise(resolve => {
			const id = ++nextIdRef.current;
			const worker = getWorker();
			setIsRunning(true);

			const timeoutId = setTimeout(() => {
				worker.terminate();
				workerRef.current = null;
				setIsRunning(false);
				resolve(timeoutResult());
			}, MATCH_TIMEOUT_MS);

			function handleMessage(event: MessageEvent<RegexWorkerResponse>) {
				if (event.data.id !== id) return;
				clearTimeout(timeoutId);
				worker.removeEventListener("message", handleMessage);
				setIsRunning(false);
				resolve(event.data.result);
			}

			worker.addEventListener("message", handleMessage);
			const request: RegexWorkerRequest = { id, pattern, flags, testString };
			worker.postMessage(request);
		});
	}, []);

	useEffect(() => {
		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, []);

	return { run, isRunning };
}
