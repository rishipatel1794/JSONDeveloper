import { getDb } from "./db";
import { getCollections } from "./collections";
import { getEnvironments } from "./environments";
import { getFolders } from "./folders";
import { getRequests } from "./requests";
import { getGlobalVariables } from "./variables";
import type { Collection, Environment, Folder, SavedApiRequest, Variable, WorkspaceExport, WorkspaceMeta } from "../workspace/types";
import { WORKSPACE_SCHEMA_VERSION } from "../workspace/types";

export async function getWorkspaceMeta(): Promise<WorkspaceMeta> {
	const db = await getDb();
	const existing = await db.get("meta", "meta");
	return existing ?? { key: "meta", schemaVersion: WORKSPACE_SCHEMA_VERSION, activeEnvironmentId: null };
}

export async function setActiveEnvironment(environmentId: string | null): Promise<void> {
	const db = await getDb();
	const current = await getWorkspaceMeta();
	await db.put("meta", { ...current, activeEnvironmentId: environmentId });
}

function scrubSecrets(variables: Variable[], includeSecrets: boolean): Variable[] {
	return includeSecrets ? variables : variables.filter(variable => !variable.secret);
}

export async function exportWorkspace(includeSecrets: boolean): Promise<WorkspaceExport> {
	const [collections, folders, requests, environments, globalVariables, meta] = await Promise.all([
		getCollections(),
		getFolders(),
		getRequests(),
		getEnvironments(),
		getGlobalVariables(),
		getWorkspaceMeta(),
	]);

	return {
		schemaVersion: WORKSPACE_SCHEMA_VERSION,
		exportedAt: new Date().toISOString(),
		includesSecrets: includeSecrets,
		collections: collections.map(collection => ({ ...collection, variables: scrubSecrets(collection.variables, includeSecrets) })),
		folders,
		requests,
		environments: environments.map(environment => ({ ...environment, variables: scrubSecrets(environment.variables, includeSecrets) })),
		globalVariables: scrubSecrets(globalVariables, includeSecrets),
		activeEnvironmentId: meta.activeEnvironmentId,
	};
}

export interface ImportResult {
	success: boolean;
	error?: string;
}

/**
 * Imports a previously exported workspace, replacing everything currently stored. Structurally
 * validates the shape before writing anything — we never trust an arbitrary uploaded file blindly,
 * even though this data never leaves the browser either way.
 */
export async function importWorkspace(data: unknown): Promise<ImportResult> {
	const validated = validateWorkspaceExport(data);
	if (!validated) {
		return { success: false, error: "This file doesn't look like a valid workspace export." };
	}

	try {
		const db = await getDb();
		const tx = db.transaction(["collections", "folders", "requests", "environments", "globalVariables", "meta"], "readwrite");

		await tx.objectStore("collections").clear();
		await tx.objectStore("folders").clear();
		await tx.objectStore("requests").clear();
		await tx.objectStore("environments").clear();
		await tx.objectStore("globalVariables").clear();

		for (const collection of validated.collections) await tx.objectStore("collections").put(collection);
		for (const folder of validated.folders) await tx.objectStore("folders").put(folder);
		for (const request of validated.requests) await tx.objectStore("requests").put(request);
		for (const environment of validated.environments) await tx.objectStore("environments").put(environment);
		for (const variable of validated.globalVariables) await tx.objectStore("globalVariables").put(variable);

		await tx.objectStore("meta").put({
			key: "meta",
			schemaVersion: WORKSPACE_SCHEMA_VERSION,
			activeEnvironmentId: validated.activeEnvironmentId,
		});

		await tx.done;
		return { success: true };
	} catch {
		return { success: false, error: "Unable to import this workspace file." };
	}
}

export interface OpenApiImportInput {
	collection: Collection;
	folders: Folder[];
	requests: SavedApiRequest[];
	environmentName: string;
	environmentVariables: Variable[];
}

/**
 * Commits a parsed OpenAPI/Swagger import to storage in one transaction. Purely additive — unlike
 * importWorkspace(), it never clears existing stores, since an OpenAPI import always creates new
 * records alongside whatever the user already has.
 */
export async function commitOpenApiImport(input: OpenApiImportInput): Promise<Environment> {
	const db = await getDb();
	const now = new Date().toISOString();

	const environment: Environment = {
		id: crypto.randomUUID(),
		name: input.environmentName,
		variables: input.environmentVariables,
		createdAt: now,
		updatedAt: now,
	};

	const tx = db.transaction(["collections", "folders", "requests", "environments"], "readwrite");
	await tx.objectStore("collections").put(input.collection);
	for (const folder of input.folders) await tx.objectStore("folders").put(folder);
	for (const request of input.requests) await tx.objectStore("requests").put(request);
	await tx.objectStore("environments").put(environment);
	await tx.done;

	return environment;
}

function isIdArray(value: unknown): value is { id: string }[] {
	return Array.isArray(value) && value.every(item => typeof item === "object" && item !== null && typeof (item as { id?: unknown }).id === "string");
}

function validateWorkspaceExport(data: unknown): WorkspaceExport | null {
	if (typeof data !== "object" || data === null) return null;
	const record = data as Record<string, unknown>;

	if (
		!isIdArray(record.collections) ||
		!isIdArray(record.folders) ||
		!isIdArray(record.requests) ||
		!isIdArray(record.environments) ||
		!isIdArray(record.globalVariables)
	) {
		return null;
	}

	return {
		schemaVersion: typeof record.schemaVersion === "number" ? record.schemaVersion : WORKSPACE_SCHEMA_VERSION,
		exportedAt: typeof record.exportedAt === "string" ? record.exportedAt : new Date().toISOString(),
		includesSecrets: Boolean(record.includesSecrets),
		collections: record.collections as Collection[],
		folders: record.folders as Folder[],
		requests: record.requests as SavedApiRequest[],
		environments: record.environments as Environment[],
		globalVariables: record.globalVariables as Variable[],
		activeEnvironmentId: typeof record.activeEnvironmentId === "string" ? record.activeEnvironmentId : null,
	};
}
