import type { Folder, SavedApiRequest } from "./types";

export interface FolderNode {
	folder: Folder;
	children: FolderNode[];
	requests: SavedApiRequest[];
}

export interface CollectionTree {
	rootFolders: FolderNode[];
	rootRequests: SavedApiRequest[];
}

export function buildFolderTree(collectionId: string, folders: Folder[], requests: SavedApiRequest[]): CollectionTree {
	const collectionFolders = folders.filter(folder => folder.collectionId === collectionId);
	const collectionRequests = requests.filter(request => request.collectionId === collectionId);

	function buildNode(folder: Folder): FolderNode {
		const children = collectionFolders.filter(candidate => candidate.parentId === folder.id).map(buildNode);
		const folderRequests = collectionRequests.filter(request => request.folderId === folder.id);
		return { folder, children, requests: folderRequests };
	}

	const rootFolders = collectionFolders.filter(folder => !folder.parentId).map(buildNode);
	const rootRequests = collectionRequests.filter(request => !request.folderId);

	return { rootFolders, rootRequests };
}
