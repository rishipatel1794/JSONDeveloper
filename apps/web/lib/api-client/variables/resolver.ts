import type { KeyValuePair } from "@/lib/tools/shared/http";

import type { ApiRequestConfig } from "../types";
import type { ResolvedVariable, VariableContext, VariableResolutionResult } from "./types";

const VARIABLE_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

/**
 * Merges variables from all three scopes into a single lookup, applying the documented priority:
 * collection wins over environment, environment wins over global. Names are case-sensitive —
 * {{BASE_URL}} and {{base_url}} are different variables.
 */
export function buildVariableMap(context: VariableContext): Map<string, ResolvedVariable> {
	const map = new Map<string, ResolvedVariable>();

	for (const variable of context.globalVariables) {
		if (variable.enabled) map.set(variable.key, { key: variable.key, value: variable.value, scope: "global", secret: variable.secret });
	}
	for (const variable of context.environmentVariables) {
		if (variable.enabled) {
			map.set(variable.key, { key: variable.key, value: variable.value, scope: "environment", secret: variable.secret });
		}
	}
	for (const variable of context.collectionVariables) {
		if (variable.enabled) {
			map.set(variable.key, { key: variable.key, value: variable.value, scope: "collection", secret: variable.secret });
		}
	}

	return map;
}

export interface VariableToken {
	type: "text" | "variable";
	/** Raw source text — for a variable token, the full "{{NAME}}" expression including braces. */
	text: string;
	name?: string;
}

/**
 * Splits a string into plain-text runs and `{{VAR}}` tokens for syntax highlighting. Builds a fresh
 * RegExp from VARIABLE_PATTERN's source rather than reusing the shared stateful instance, since a
 * global-flagged regex tracks lastIndex across calls and this can be invoked while another match
 * loop elsewhere in the same call stack is mid-iteration.
 */
export function tokenizeVariableString(input: string): VariableToken[] {
	const pattern = new RegExp(VARIABLE_PATTERN.source, "g");
	const tokens: VariableToken[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = pattern.exec(input))) {
		if (match.index > lastIndex) tokens.push({ type: "text", text: input.slice(lastIndex, match.index) });
		tokens.push({ type: "variable", text: match[0], name: match[1] });
		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < input.length) tokens.push({ type: "text", text: input.slice(lastIndex) });

	return tokens;
}

export function resolveString(input: string, variableMap: Map<string, ResolvedVariable>): VariableResolutionResult {
	const missing: string[] = [];
	const referenced: string[] = [];

	const value = input.replace(VARIABLE_PATTERN, (match, name: string) => {
		referenced.push(name);
		const resolved = variableMap.get(name);
		if (!resolved) {
			missing.push(name);
			return match; // Leave the placeholder visible rather than silently blanking it out.
		}
		return resolved.value;
	});

	return { value, missing: [...new Set(missing)], referenced: [...new Set(referenced)] };
}

function resolvePairs(pairs: KeyValuePair[], variableMap: Map<string, ResolvedVariable>): { pairs: KeyValuePair[]; missing: string[] } {
	const missing: string[] = [];

	const resolved = pairs.map(pair => {
		const key = resolveString(pair.key, variableMap);
		const value = resolveString(pair.value, variableMap);
		missing.push(...key.missing, ...value.missing);
		return { ...pair, key: key.value, value: value.value };
	});

	return { pairs: resolved, missing: [...new Set(missing)] };
}

export interface ResolvedRequest {
	request: ApiRequestConfig;
	missing: string[];
}

/**
 * Produces a resolved COPY of the request for execution — the original, with {{VAR}} expressions
 * intact, is never mutated. This is what gets sent to the Express proxy; the stored/edited request
 * always keeps its variable expressions so it keeps working across environments.
 */
export function resolveRequestVariables(request: ApiRequestConfig, variableMap: Map<string, ResolvedVariable>): ResolvedRequest {
	const missing = new Set<string>();

	const url = resolveString(request.url, variableMap);
	url.missing.forEach(name => missing.add(name));

	const queryParams = resolvePairs(request.queryParams, variableMap);
	queryParams.missing.forEach(name => missing.add(name));

	const headers = resolvePairs(request.headers, variableMap);
	headers.missing.forEach(name => missing.add(name));

	const body = resolveString(request.body, variableMap);
	body.missing.forEach(name => missing.add(name));

	const formData = resolvePairs(request.formData, variableMap);
	formData.missing.forEach(name => missing.add(name));

	let auth = request.auth;
	if (auth.type === "bearer") {
		const token = resolveString(auth.token, variableMap);
		token.missing.forEach(name => missing.add(name));
		auth = { type: "bearer", token: token.value };
	} else if (auth.type === "basic") {
		const username = resolveString(auth.username, variableMap);
		const password = resolveString(auth.password, variableMap);
		username.missing.forEach(name => missing.add(name));
		password.missing.forEach(name => missing.add(name));
		auth = { type: "basic", username: username.value, password: password.value };
	} else if (auth.type === "api-key") {
		const key = resolveString(auth.key, variableMap);
		const value = resolveString(auth.value, variableMap);
		key.missing.forEach(name => missing.add(name));
		value.missing.forEach(name => missing.add(name));
		auth = { ...auth, key: key.value, value: value.value };
	}

	return {
		request: {
			...request,
			url: url.value,
			queryParams: queryParams.pairs,
			headers: headers.pairs,
			body: body.value,
			formData: formData.pairs,
			auth,
		},
		missing: [...missing],
	};
}
