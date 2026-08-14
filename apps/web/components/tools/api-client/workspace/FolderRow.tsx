import { useState } from "react";
import { ChevronDown, ChevronRight, Folder as FolderIcon, Plus } from "lucide-react";

import { ContextMenu } from "@/components/ui/ContextMenu";
import type { FolderNode } from "@/lib/api-client/workspace/tree";

import { MethodBadge } from "./MethodBadge";
import type { SidebarActions } from "./SidebarActions";

interface FolderRowProps {
	node: FolderNode;
	openRequestId: string | null;
	actions: SidebarActions;
	depth: number;
}

export function FolderRow({ node, openRequestId, actions, depth }: FolderRowProps) {
	const [expanded, setExpanded] = useState(true);
	const ChevronIcon = expanded ? ChevronDown : ChevronRight;
	const indent = { paddingLeft: `${depth * 14 + 8}px` };

	return (
		<div>
			<div
				className="group flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm hover:bg-secondary"
				style={indent}
				role="treeitem"
				aria-expanded={expanded}
			>
				<button
					type="button"
					onClick={() => setExpanded(current => !current)}
					className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-foreground"
				>
					<ChevronIcon className="size-3.5 shrink-0 text-muted-foreground" />
					<FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
					<span className="truncate">{node.folder.name}</span>
				</button>

				<button
					type="button"
					onClick={() => actions.onNewRequest(node.folder.collectionId, node.folder.id)}
					aria-label={`New request in ${node.folder.name}`}
					className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-card hover:text-foreground group-hover:opacity-100"
				>
					<Plus className="size-3.5" />
				</button>

				<ContextMenu
					label={`${node.folder.name} folder actions`}
					items={[
						{ label: "New Request", onClick: () => actions.onNewRequest(node.folder.collectionId, node.folder.id) },
						{ label: "New Folder", onClick: () => actions.onNewFolder(node.folder.collectionId, node.folder.id) },
						{ label: "Rename", onClick: () => actions.onRenameFolder(node.folder.id, node.folder.name) },
						{ label: "Delete", onClick: () => actions.onDeleteFolder(node.folder.id, node.folder.name), destructive: true },
					]}
				/>
			</div>

			{expanded && (
				<div role="group">
					{node.children.map(child => (
						<FolderRow key={child.folder.id} node={child} openRequestId={openRequestId} actions={actions} depth={depth + 1} />
					))}

					{node.requests.map(request => (
						<div
							key={request.id}
							role="treeitem"
							aria-selected={request.id === openRequestId}
							className={`group flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-sm ${
								request.id === openRequestId ? "bg-primary/10 text-primary-accent" : "text-foreground hover:bg-secondary"
							}`}
							style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
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

					{node.children.length === 0 && node.requests.length === 0 && (
						<p className="py-1 pr-2 text-xs text-subtle-foreground" style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}>
							Empty folder
						</p>
					)}
				</div>
			)}
		</div>
	);
}
