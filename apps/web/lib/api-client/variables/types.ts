import type { Variable, VariableScope } from "../workspace/types";

export interface VariableContext {
	collectionVariables: Variable[];
	environmentVariables: Variable[];
	globalVariables: Variable[];
}

export interface ResolvedVariable {
	key: string;
	value: string;
	scope: VariableScope;
	secret?: boolean;
}

export interface VariableResolutionResult {
	value: string;
	/** Variable names referenced in the input that have no defined value anywhere in scope. */
	missing: string[];
	/** Every variable name referenced in the input, whether or not it resolved. */
	referenced: string[];
}

export interface TokenCandidate {
	path: string;
	value: string;
	looksLikeJwt: boolean;
}
