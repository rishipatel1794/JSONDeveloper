import { getDb } from "./db";
import type { SavedApiRequest } from "../workspace/types";

export async function getRequests(collectionId?: string): Promise<SavedApiRequest[]> {
	const db = await getDb();
	if (collectionId) return db.getAllFromIndex("requests", "collectionId", collectionId);
	return db.getAll("requests");
}

export async function getRequest(id: string): Promise<SavedApiRequest | undefined> {
	const db = await getDb();
	return db.get("requests", id);
}

export async function saveRequest(request: SavedApiRequest): Promise<SavedApiRequest> {
	const db = await getDb();
	await db.put("requests", request);
	return request;
}

export async function deleteRequest(id: string): Promise<void> {
	const db = await getDb();
	await db.delete("requests", id);
}

export async function duplicateRequest(id: string): Promise<SavedApiRequest | undefined> {
	const db = await getDb();
	const original = await db.get("requests", id);
	if (!original) return undefined;

	const now = new Date().toISOString();
	const duplicated: SavedApiRequest = {
		...original,
		id: crypto.randomUUID(),
		name: `${original.name} Copy`,
		extractionRules: original.extractionRules.map(rule => ({ ...rule, id: crypto.randomUUID() })),
		createdAt: now,
		updatedAt: now,
	};

	await db.put("requests", duplicated);
	return duplicated;
}
