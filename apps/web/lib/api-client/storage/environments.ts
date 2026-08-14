import { getDb } from "./db";
import type { Environment } from "../workspace/types";

export async function getEnvironments(): Promise<Environment[]> {
	const db = await getDb();
	return db.getAll("environments");
}

export async function createEnvironment(name: string): Promise<Environment> {
	const db = await getDb();
	const now = new Date().toISOString();

	const environment: Environment = {
		id: crypto.randomUUID(),
		name: name.trim(),
		variables: [],
		createdAt: now,
		updatedAt: now,
	};

	await db.put("environments", environment);
	return environment;
}

export async function updateEnvironment(
	id: string,
	patch: Partial<Omit<Environment, "id" | "createdAt">>,
): Promise<Environment | undefined> {
	const db = await getDb();
	const existing = await db.get("environments", id);
	if (!existing) return undefined;

	const updated: Environment = { ...existing, ...patch, updatedAt: new Date().toISOString() };
	await db.put("environments", updated);
	return updated;
}

export async function deleteEnvironment(id: string): Promise<void> {
	const db = await getDb();
	await db.delete("environments", id);
}

export async function duplicateEnvironment(id: string): Promise<Environment | undefined> {
	const db = await getDb();
	const original = await db.get("environments", id);
	if (!original) return undefined;

	const now = new Date().toISOString();
	const duplicated: Environment = {
		...original,
		id: crypto.randomUUID(),
		name: `${original.name} Copy`,
		variables: original.variables.map(variable => ({ ...variable, id: crypto.randomUUID() })),
		createdAt: now,
		updatedAt: now,
	};

	await db.put("environments", duplicated);
	return duplicated;
}
