import { useState } from "react";
import { ChevronDown, ChevronRight, FolderClosed, Plus } from "lucide-react";

import { ContextMenu } from "@/components/ui/ContextMenu";
import { buildFolderTree } from "@/lib/api-client/workspace/tree";
import type { Collection, Folder, SavedApiRequest } from "@/lib/api-client/workspace/types";

import { FolderRow } from "./FolderRow";
import { MethodBadge } from "./MethodBadge";
import type { SidebarActions } from "./SidebarActions";

interface CollectionItemProps {
	collection: Collection;
	folders: Folder[];
	requests: SavedApiRequest[];
	openRequestId: string | null;
	actions: SidebarActions;
	defaultExpanded?: boolean;
}

export function CollectionItem({ collection, folders, requests, openRequestId, actions, defaultExpanded = true }: CollectionItemProps) {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const ChevronIcon = expanded ? ChevronDown : ChevronRight;
	const tree = buildFolderTree(collection.id, folders, requests);

	return (
		<div>
			<div className="group flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm font-medium hover:bg-secondary" role="treeitem" aria-expanded={expanded}>
				<button type="button" onClick={() => setExpanded(current => !current)} className="flex min-w-0 flex-1 items-center gap-1.5 pl-2 text-left text-foreground">
					<ChevronIcon className="size-3.5 shrink-0 text-muted-foreground" />
					<FolderClosed className="size-3.5 shrink-0 text-primary" />
					<span className="truncate">{collection.name}</span>
				</button>

				<button
					type="button"
					onClick={() => actions.onNewRequest(collection.id)}
					aria-label={`New request in ${collection.name}`}
					className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-card hover:text-foreground group-hover:opacity-100"
				>
					<Plus className="size-3.5" />
				</button>

				<ContextMenu
					label={`${collection.name} collection actions`}
					items={[
						{ label: "New Request", onClick: () => actions.onNewRequest(collection.id) },
						{ label: "New Folder", onClick: () => actions.onNewFolder(collection.id) },
						{ label: "Variables", onClick: () => actions.onCollectionVariables(collection.id) },
						{ label: "Rename", onClick: () => actions.onRenameCollection(collection.id, collection.name) },
						{ label: "Duplicate", onClick: () => actions.onDuplicateCollection(collection.id) },
						{ label: "Delete", onClick: () => actions.onDeleteCollection(collection.id, collection.name), destructive: true },
					]}
				/>
			</div>

			{expanded && (
				<div role="group">
					{tree.rootFolders.map(node => (
						<FolderRow key={node.folder.id} node={node} openRequestId={openRequestId} actions={actions} depth={1} />
					))}

					{tree.rootRequests.map(request => (
						<div
							key={request.id}
							role="treeitem"
							aria-selected={request.id === openRequestId}
							className={`group flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 pl-6 text-sm ${
								request.id === openRequestId ? "bg-primary/10 text-primary-accent" : "text-foreground hover:bg-secondary"
							}`}
							onClick={() => actions.onOpenRequest(request.id)}
						>
							<MethodBadge method={request.method} />
							<span className="min-w-0 flex-1 truncate">{request.name}</span>
							<ContextMenu
								label={`${request.name} actions`}
								items={[
									{ label: "Rename", onClick: () => actions.onRenameRequest(request.id, request.name) },
									{ label: "Duplicate", onClick: () => actions.onDuplicateRequest(request.id) },
									{ label: "Delete", onClick: () => actions.onDeleteRequest(request.id, request.name), destructive: true },
								]}
							/>
						</div>
					))}

					{tree.rootFolders.length === 0 && tree.rootRequests.length === 0 && (
						<p className="py-1 pl-8 pr-2 text-xs text-subtle-foreground">No requests yet.</p>
					)}
				</div>
			)}
		</div>
	);
}
