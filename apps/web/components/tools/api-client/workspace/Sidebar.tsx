"use client";

import { useMemo, useState } from "react";
import { FolderPlus, Search, Settings2 } from "lucide-react";

import type { Collection, Environment, Folder, SavedApiRequest } from "@/lib/api-client/workspace/types";

import { CollectionItem } from "./CollectionItem";
import { MethodBadge } from "./MethodBadge";
import type { SidebarActions } from "./SidebarActions";

interface SidebarProps {
	collections: Collection[];
	folders: Folder[];
	requests: SavedApiRequest[];
	environments: Environment[];
	openRequestId: string | null;
	actions: SidebarActions;
	onNewCollection: () => void;
	onManageEnvironments: () => void;
	onManageGlobalVariables: () => void;
}

export function Sidebar({
	collections,
	folders,
	requests,
	environments,
	openRequestId,
	actions,
	onNewCollection,
	onManageEnvironments,
	onManageGlobalVariables,
}: SidebarProps) {
	const [query, setQuery] = useState("");

	const searchResults = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return null;

		return requests
			.filter(request => request.name.toLowerCase().includes(trimmed) || request.url.toLowerCase().includes(trimmed))
			.map(request => {
				const collection = collections.find(c => c.id === request.collectionId);
				const folder = request.folderId ? folders.find(f => f.id === request.folderId) : undefined;
				return { request, path: [collection?.name, folder?.name].filter(Boolean).join(" / ") };
			});
	}, [query, requests, collections, folders]);

	return (
		<aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-card">
			<div className="border-b border-border p-3">
				<div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
					<Search className="size-3.5 shrink-0 text-muted-foreground" />
					<input
						type="search"
						value={query}
						onChange={event => setQuery(event.target.value)}
						placeholder="Search requests..."
						className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-2">
				{searchResults ? (
					<div role="tree" aria-label="Search results" className="space-y-0.5">
						{searchResults.length === 0 && <p className="p-3 text-sm text-muted-foreground">No requests match &quot;{query}&quot;.</p>}
						{searchResults.map(({ request, path }) => (
							<button
								key={request.id}
								type="button"
								onClick={() => actions.onOpenRequest(request.id)}
								className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
									request.id === openRequestId ? "bg-primary/10 text-primary-accent" : "text-foreground hover:bg-secondary"
								}`}
							>
								<MethodBadge method={request.method} />
								<span className="min-w-0 flex-1 truncate">
									{request.name}
									{path && <span className="ml-1.5 text-xs text-subtle-foreground">{path}</span>}
								</span>
							</button>
						))}
					</div>
				) : (
					<>
						<div className="mb-1 flex items-center justify-between px-2">
							<h2 className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Collections</h2>
							<button
								type="button"
								onClick={onNewCollection}
								aria-label="New collection"
								className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
							>
								<FolderPlus className="size-3.5" />
							</button>
						</div>

						{collections.length === 0 ? (
							<p className="px-2 py-3 text-sm text-muted-foreground">No collections yet.</p>
						) : (
							<div role="tree" aria-label="Collections" className="space-y-0.5">
								{collections.map(collection => (
									<CollectionItem
										key={collection.id}
										collection={collection}
										folders={folders}
										requests={requests}
										openRequestId={openRequestId}
										actions={actions}
									/>
								))}
							</div>
						)}
					</>
				)}
			</div>

			<div className="border-t border-border p-2">
				<button
					type="button"
					onClick={onManageEnvironments}
					className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
				>
					<Settings2 className="size-3.5 text-muted-foreground" />
					Environments
					<span className="ml-auto text-xs text-subtle-foreground">{environments.length}</span>
				</button>

				<button
					type="button"
					onClick={onManageGlobalVariables}
					className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
				>
					<Settings2 className="size-3.5 text-muted-foreground" />
					Global Variables
				</button>
			</div>
		</aside>
	);
}
