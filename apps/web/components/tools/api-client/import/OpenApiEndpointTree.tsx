"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";

import { MethodBadge } from "@/components/tools/api-client/workspace/MethodBadge";
import type { HttpMethod } from "@/lib/tools/shared/http";

const REQUESTS_PER_FOLDER_PAGE = 50;

/**
 * Structurally minimal — satisfied by both ImportedFolder/ImportedRequest (OpenAPI) and
 * DirectImportedFolder/DirectImportedRequest (Postman, cURL), so this tree renders any import source's preview.
 */
interface EndpointPreview {
	previewId: string;
	name: string;
	method: string;
	deprecated: boolean;
}

interface FolderPreview {
	name: string;
	requests: EndpointPreview[];
}

interface OpenApiEndpointTreeProps {
	folders: FolderPreview[];
	selectedIds: Set<string>;
	onChange: (selectedIds: Set<string>) => void;
}

export function OpenApiEndpointTree({ folders, selectedIds, onChange }: OpenApiEndpointTreeProps) {
	const allIds = folders.flatMap(folder => folder.requests.map(request => request.previewId));
	const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));

	function toggleAll() {
		onChange(allSelected ? new Set() : new Set(allIds));
	}

	function toggleFolder(folder: FolderPreview) {
		const folderIds = folder.requests.map(request => request.previewId);
		const allFolderSelected = folderIds.every(id => selectedIds.has(id));
		const next = new Set(selectedIds);
		if (allFolderSelected) folderIds.forEach(id => next.delete(id));
		else folderIds.forEach(id => next.add(id));
		onChange(next);
	}

	function toggleRequest(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onChange(next);
	}

	return (
		<div className="rounded-md border border-border">
			<label className="flex items-center gap-2 border-b border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground">
				<input type="checkbox" checked={allSelected} onChange={toggleAll} className="size-4 rounded border-border accent-primary" />
				Select All ({allIds.length} endpoint{allIds.length === 1 ? "" : "s"})
			</label>

			<div className="max-h-96 overflow-y-auto p-2">
				{folders.map(folder => (
					<FolderSection
						key={folder.name}
						folder={folder}
						selectedIds={selectedIds}
						onToggleFolder={() => toggleFolder(folder)}
						onToggleRequest={toggleRequest}
					/>
				))}
			</div>
		</div>
	);
}

interface FolderSectionProps {
	folder: FolderPreview;
	selectedIds: Set<string>;
	onToggleFolder: () => void;
	onToggleRequest: (id: string) => void;
}

function FolderSection({ folder, selectedIds, onToggleFolder, onToggleRequest }: FolderSectionProps) {
	const [expanded, setExpanded] = useState(true);
	const [visibleCount, setVisibleCount] = useState(REQUESTS_PER_FOLDER_PAGE);

	const folderIds = folder.requests.map(request => request.previewId);
	const selectedCount = folderIds.filter(id => selectedIds.has(id)).length;
	const allSelected = folderIds.length > 0 && selectedCount === folderIds.length;
	const someSelected = selectedCount > 0 && !allSelected;

	const visibleRequests: EndpointPreview[] = folder.requests.slice(0, visibleCount);
	const remaining = folder.requests.length - visibleRequests.length;

	return (
		<div className="mb-1">
			<div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary">
				<input
					type="checkbox"
					checked={allSelected}
					ref={element => {
						if (element) element.indeterminate = someSelected;
					}}
					onChange={onToggleFolder}
					className="size-4 rounded border-border accent-primary"
				/>
				<button
					type="button"
					onClick={() => setExpanded(current => !current)}
					className="flex flex-1 items-center gap-1.5 text-left text-sm font-medium text-foreground"
				>
					{expanded ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
					{folder.name}
					<span className="text-xs font-normal text-muted-foreground">
						({selectedCount}/{folderIds.length})
					</span>
				</button>
			</div>

			{expanded && (
				<div className="ml-6 space-y-0.5">
					{visibleRequests.map(request => (
						<label key={request.previewId} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-secondary">
							<input
								type="checkbox"
								checked={selectedIds.has(request.previewId)}
								onChange={() => onToggleRequest(request.previewId)}
								className="size-3.5 rounded border-border accent-primary"
							/>
							<MethodBadge method={request.method as HttpMethod} />
							<span className="min-w-0 flex-1 truncate text-foreground">{request.name}</span>
							{request.deprecated && (
								<span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
									<AlertTriangle className="size-2.5" />
									Deprecated
								</span>
							)}
						</label>
					))}

					{remaining > 0 && (
						<button
							type="button"
							onClick={() => setVisibleCount(count => count + REQUESTS_PER_FOLDER_PAGE)}
							className="px-2 py-1 text-xs text-primary-accent hover:underline"
						>
							Show {Math.min(remaining, REQUESTS_PER_FOLDER_PAGE)} more…
						</button>
					)}
				</div>
			)}
		</div>
	);
}
