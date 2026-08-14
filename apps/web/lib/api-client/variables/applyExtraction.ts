import { createVariable } from "../storage/variables";
import type { Environment, Variable, VariableExtractionRule } from "../workspace/types";
import { extractJsonValue } from "./extractor";

export interface ApplyExtractionContext {
	globalVariables: Variable[];
	environments: Environment[];
	collectionVariables?: Variable[];
}

export interface ApplyExtractionResult {
	updatedVariableNames: string[];
	globalVariables: Variable[];
	collectionVariables?: Variable[];
	environmentUpdates: { environmentId: string; variables: Variable[] }[];
	errors: string[];
}

function upsertVariable(list: Variable[], name: string, value: string, secret: boolean): Variable[] {
	const existingIndex = list.findIndex(variable => variable.key === name);
	if (existingIndex === -1) return [...list, createVariable(name, value, secret)];

	const next = [...list];
	const existing = next[existingIndex];
	if (!existing) return next;
	next[existingIndex] = { ...existing, value, secret: secret || Boolean(existing.secret) };
	return next;
}

/**
 * Pure computation of the variable updates a set of extraction rules produce — the caller is
 * responsible for actually persisting the returned arrays and reloading the workspace.
 */
export function applyExtractionRules(rules: VariableExtractionRule[], responseBody: string, context: ApplyExtractionContext): ApplyExtractionResult {
	const updatedVariableNames: string[] = [];
	const errors: string[] = [];

	let globalVariables = [...context.globalVariables];
	let collectionVariables = context.collectionVariables ? [...context.collectionVariables] : undefined;
	const environmentUpdatesMap = new Map<string, Variable[]>();

	for (const rule of rules) {
		const result = extractJsonValue(responseBody, rule.responsePath);
		if (!result.success) {
			errors.push(`${rule.variableName}: ${result.error}`);
			continue;
		}

		const value = typeof result.value === "string" ? result.value : JSON.stringify(result.value);

		if (rule.scope === "global") {
			globalVariables = upsertVariable(globalVariables, rule.variableName, value, rule.secret);
			updatedVariableNames.push(rule.variableName);
		} else if (rule.scope === "environment" && rule.environmentId) {
			const environment = context.environments.find(candidate => candidate.id === rule.environmentId);
			if (!environment) {
				errors.push(`${rule.variableName}: target environment not found.`);
				continue;
			}
			const currentList = environmentUpdatesMap.get(rule.environmentId) ?? environment.variables;
			environmentUpdatesMap.set(rule.environmentId, upsertVariable(currentList, rule.variableName, value, rule.secret));
			updatedVariableNames.push(rule.variableName);
		} else if (rule.scope === "collection" && collectionVariables) {
			collectionVariables = upsertVariable(collectionVariables, rule.variableName, value, rule.secret);
			updatedVariableNames.push(rule.variableName);
		} else {
			errors.push(`${rule.variableName}: could not determine where to save this variable.`);
		}
	}

	return {
		updatedVariableNames: [...new Set(updatedVariableNames)],
		globalVariables,
		collectionVariables,
		environmentUpdates: [...environmentUpdatesMap.entries()].map(([environmentId, variables]) => ({ environmentId, variables })),
		errors,
	};
}
