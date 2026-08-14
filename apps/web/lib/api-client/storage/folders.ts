import { getDb } from "./db";
import type { Folder } from "../workspace/types";

export async function getFolders(collectionId?: string): Promise<Folder[]> {
	const db = await getDb();
	if (collectionId) return db.getAllFromIndex("folders", "collectionId", collectionId);
	return db.getAll("folders");
}

export async function createFolder(input: { name: string; collectionId: string; parentId?: string }): Promise<Folder> {
	const db = await getDb();

	const folder: Folder = {
		id: crypto.randomUUID(),
		name: input.name.trim(),
		collectionId: input.collectionId,
		parentId: input.parentId,
		createdAt: new Date().toISOString(),
	};

	await db.put("folders", folder);
	return folder;
}

export async function updateFolder(id: string, patch: Partial<Omit<Folder, "id" | "collectionId" | "createdAt">>): Promise<Folder | undefined> {
	const db = await getDb();
	const existing = await db.get("folders", id);
	if (!existing) return undefined;

	const updated: Folder = { ...existing, ...patch };
	await db.put("folders", updated);
	return updated;
}

/** Deletes a folder along with every sub-folder and request nested inside it, recursively. */
export async function deleteFolder(id: string): Promise<void> {
	const db = await getDb();
	const allFolders = await db.getAll("folders");
	const allRequests = await db.getAll("requests");

	const idsToDelete = new Set<string>([id]);
	let changed = true;

	while (changed) {
		changed = false;
		for (const folder of allFolders) {
			if (folder.parentId && idsToDelete.has(folder.parentId) && !idsToDelete.has(folder.id)) {
				idsToDelete.add(folder.id);
				changed = true;
			}
		}
	}

	const tx = db.transaction(["folders", "requests"], "readwrite");

	for (const folderId of idsToDelete) {
		await tx.objectStore("folders").delete(folderId);
	}

	for (const request of allRequests) {
		if (request.folderId && idsToDelete.has(request.folderId)) {
			await tx.objectStore("requests").delete(request.id);
		}
	}

	await tx.done;
}
