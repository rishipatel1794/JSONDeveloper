"use client";

import { useEffect, useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { Collection, Folder } from "@/lib/api-client/workspace/types";

interface SaveRequestDialogProps {
	open: boolean;
	initialName?: string;
	collections: Collection[];
	folders: Folder[];
	initialCollectionId?: string;
	initialFolderId?: string;
	onCancel: () => void;
	onConfirm: (input: { name: string; collectionId: string; folderId?: string }) => void;
}

export function SaveRequestDialog({
	open,
	initialName = "",
	collections,
	folders,
	initialCollectionId,
	initialFolderId,
	onCancel,
	onConfirm,
}: SaveRequestDialogProps) {
	const [name, setName] = useState(initialName);
	const [collectionId, setCollectionId] = useState(initialCollectionId ?? collections[0]?.id ?? "");
	const [folderId, setFolderId] = useState(initialFolderId ?? "");
	const [error, setError] = useState("");

	useEffect(() => {
		if (open) {
			setName(initialName);
			setCollectionId(initialCollectionId ?? collections[0]?.id ?? "");
			setFolderId(initialFolderId ?? "");
			setError("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const availableFolders = folders.filter(folder => folder.collectionId === collectionId);

	function handleConfirm() {
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Name is required.");
			return;
		}
		if (!collectionId) {
			setError("Choose a collection to save this request into.");
			return;
		}
		onConfirm({ name: trimmedName, collectionId, folderId: folderId || undefined });
	}

	return (
		<Dialog open={open} onClose={onCancel} title="Save Request">
			{collections.length === 0 ? (
				<p className="text-sm text-muted-foreground">Create a collection first, then you can save requests into it.</p>
			) : (
				<div className="space-y-3">
					<label className="block">
						<span className="mb-1 block text-xs font-medium text-muted-foreground">Name</span>
						<input
							type="text"
							value={name}
							onChange={event => {
								setName(event.target.value);
								if (error) setError("");
							}}
							autoFocus
							className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-xs font-medium text-muted-foreground">Collection</span>
						<select
							value={collectionId}
							onChange={event => {
								setCollectionId(event.target.value);
								setFolderId("");
							}}
							className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							{collections.map(collection => (
								<option key={collection.id} value={collection.id}>
									{collection.name}
								</option>
							))}
						</select>
					</label>

					{availableFolders.length > 0 && (
						<label className="block">
							<span className="mb-1 block text-xs font-medium text-muted-foreground">Folder (optional)</span>
							<select
								value={folderId}
								onChange={event => setFolderId(event.target.value)}
								className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<option value="">No folder</option>
								{availableFolders.map(folder => (
									<option key={folder.id} value={folder.id}>
										{folder.name}
									</option>
								))}
							</select>
						</label>
					)}

					{error && <p className="text-xs text-destructive">{error}</p>}
				</div>
			)}

			<div className="mt-5 flex justify-end gap-2">
				<Button onClick={onCancel} variant="ghost">
					Cancel
				</Button>
				<Button onClick={handleConfirm} disabled={collections.length === 0}>
					Save
				</Button>
			</div>
		</Dialog>
	);
}
