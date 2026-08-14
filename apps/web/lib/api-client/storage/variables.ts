import { getDb } from "./db";
import type { Variable } from "../workspace/types";

export async function getGlobalVariables(): Promise<Variable[]> {
	const db = await getDb();
	return db.getAll("globalVariables");
}

export async function setGlobalVariables(variables: Variable[]): Promise<void> {
	const db = await getDb();
	const tx = db.transaction("globalVariables", "readwrite");
	await tx.store.clear();
	for (const variable of variables) await tx.store.put(variable);
	await tx.done;
}

export function createVariable(key = "", value = "", secret = false): Variable {
	return { id: crypto.randomUUID(), key, value, enabled: true, secret };
}

const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function isValidVariableName(name: string): boolean {
	return VARIABLE_NAME_PATTERN.test(name);
}

const SECRET_NAME_HINTS = /token|secret|password|api[_-]?key|auth/i;

/** Heuristic used to pre-check the "Secret variable" box when a name looks credential-like. */
export function nameSuggestsSecret(name: string): boolean {
	return SECRET_NAME_HINTS.test(name);
}
