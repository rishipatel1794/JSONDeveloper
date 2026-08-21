export interface SidebarActions {
	onOpenRequest: (requestId: string) => void;
	onNewRequest: (collectionId: string, folderId?: string) => void;
	onNewFolder: (collectionId: string, parentId?: string) => void;
	onRenameCollection: (id: string, currentName: string) => void;
	onDuplicateCollection: (id: string) => void;
	onDeleteCollection: (id: string, name: string) => void;
	onCollectionVariables: (id: string) => void;
	onExportCollection: (id: string) => void;
	onRenameFolder: (id: string, currentName: string) => void;
	onDeleteFolder: (id: string, name: string) => void;
	onRenameRequest: (id: string, currentName: string) => void;
	onDuplicateRequest: (id: string) => void;
	onDeleteRequest: (id: string, name: string) => void;
}
