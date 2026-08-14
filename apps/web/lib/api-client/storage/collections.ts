import { getDb } from "./db";
import type { Collection, Folder, SavedApiRequest } from "../workspace/types";

export async function getCollections(): Promise<Collection[]> {
	const db = await getDb();
	return db.getAll("collections");
}

export async function getCollection(id: string): Promise<Collection | undefined> {
	const db = await getDb();
	return db.get("collections", id);
}

export async function createCollection(input: { name: string; description?: string }): Promise<Collection> {
	const db = await getDb();
	const now = new Date().toISOString();

	const collection: Collection = {
		id: crypto.randomUUID(),
		name: input.name.trim(),
		description: input.description?.trim() || undefined,
		variables: [],
		createdAt: now,
		updatedAt: now,
	};

	await db.put("collections", collection);
	return collection;
}

export async function updateCollection(
	id: string,
	patch: Partial<Omit<Collection, "id" | "createdAt">>,
): Promise<Collection | undefined> {
	const db = await getDb();
	const existing = await db.get("collections", id);
	if (!existing) return undefined;

	const updated: Collection = { ...existing, ...patch, updatedAt: new Date().toISOString() };
	await db.put("collections", updated);
	return updated;
}

export async function deleteCollection(id: string): Promise<void> {
	const db = await getDb();
	const tx = db.transaction(["collections", "folders", "requests"], "readwrite");

	await tx.objectStore("collections").delete(id);

	const folderIndex = tx.objectStore("folders").index("collectionId");
	for await (const cursor of folderIndex.iterate(id)) {
		await cursor.delete();
	}

	const requestIndex = tx.objectStore("requests").index("collectionId");
	for await (const cursor of requestIndex.iterate(id)) {
		await cursor.delete();
	}

	await tx.done;
}

/** Deep-duplicates a collection along with all of its folders and requests, remapping every ID. */
export async function duplicateCollection(id: string): Promise<Collection | undefined> {
	const db = await getDb();
	const original = await db.get("collections", id);
	if (!original) return undefined;

	const now = new Date().toISOString();
	const newCollectionId = crypto.randomUUID();

	const duplicated: Collection = {
		...original,
		id: newCollectionId,
		name: `${original.name} Copy`,
		variables: original.variables.map(variable => ({ ...variable, id: crypto.randomUUID() })),
		createdAt: now,
		updatedAt: now,
	};

	const originalFolders = await db.getAllFromIndex("folders", "collectionId", id);
	const folderIdMap = new Map<string, string>();
	for (const folder of originalFolders) folderIdMap.set(folder.id, crypto.randomUUID());

	const duplicatedFolders: Folder[] = originalFolders.map(folder => {
		const newId = folderIdMap.get(folder.id);
		if (!newId) throw new Error("Folder ID mapping missing during duplication.");

		return {
			...folder,
			id: newId,
			collectionId: newCollectionId,
			parentId: folder.parentId ? folderIdMap.get(folder.parentId) : undefined,
			createdAt: now,
		};
	});

	const originalRequests = await db.getAllFromIndex("requests", "collectionId", id);
	const duplicatedRequests: SavedApiRequest[] = originalRequests.map(request => ({
		...request,
		id: crypto.randomUUID(),
		collectionId: newCollectionId,
		folderId: request.folderId ? folderIdMap.get(request.folderId) : undefined,
		extractionRules: request.extractionRules.map(rule => ({ ...rule, id: crypto.randomUUID() })),
		createdAt: now,
		updatedAt: now,
	}));

	const tx = db.transaction(["collections", "folders", "requests"], "readwrite");
	await tx.objectStore("collections").put(duplicated);
	for (const folder of duplicatedFolders) await tx.objectStore("folders").put(folder);
	for (const request of duplicatedRequests) await tx.objectStore("requests").put(request);
	await tx.done;

	return duplicated;
}
