import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { Collection, Environment, Folder, SavedApiRequest, Variable, WorkspaceMeta } from "../workspace/types";
import { WORKSPACE_SCHEMA_VERSION } from "../workspace/types";

const DB_NAME = "devtools-api-workspace";

export interface WorkspaceDB extends DBSchema {
	collections: { key: string; value: Collection };
	folders: { key: string; value: Folder; indexes: { collectionId: string } };
	requests: { key: string; value: SavedApiRequest; indexes: { collectionId: string } };
	environments: { key: string; value: Environment };
	globalVariables: { key: string; value: Variable };
	meta: { key: string; value: WorkspaceMeta };
}

let dbPromise: Promise<IDBPDatabase<WorkspaceDB>> | null = null;

/**
 * Lazily opens the workspace database. Never call this outside a browser context (event handlers,
 * useEffect) — indexedDB doesn't exist during server rendering, and calling this at module scope
 * or in a component's render body would break SSR.
 */
export function getDb(): Promise<IDBPDatabase<WorkspaceDB>> {
	if (!dbPromise) {
		dbPromise = openDB<WorkspaceDB>(DB_NAME, WORKSPACE_SCHEMA_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains("collections")) {
					db.createObjectStore("collections", { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains("folders")) {
					const folders = db.createObjectStore("folders", { keyPath: "id" });
					folders.createIndex("collectionId", "collectionId");
				}
				if (!db.objectStoreNames.contains("requests")) {
					const requests = db.createObjectStore("requests", { keyPath: "id" });
					requests.createIndex("collectionId", "collectionId");
				}
				if (!db.objectStoreNames.contains("environments")) {
					db.createObjectStore("environments", { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains("globalVariables")) {
					db.createObjectStore("globalVariables", { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains("meta")) {
					db.createObjectStore("meta", { keyPath: "key" });
				}
			},
		});
	}

	return dbPromise;
}

export function isIndexedDbAvailable(): boolean {
	return typeof indexedDB !== "undefined";
}
