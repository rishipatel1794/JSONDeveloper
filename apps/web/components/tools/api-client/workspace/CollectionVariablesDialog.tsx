"use client";

import { useEffect, useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { updateCollection } from "@/lib/api-client/storage/collections";
import { createVariable } from "@/lib/api-client/storage/variables";
import type { Collection, Variable } from "@/lib/api-client/workspace/types";

import { VariableTable } from "./VariableTable";

interface CollectionVariablesDialogProps {
	open: boolean;
	collection: Collection | null;
	onClose: () => void;
}

export function CollectionVariablesDialog({ open, collection, onClose }: CollectionVariablesDialogProps) {
	const [local, setLocal] = useState<Variable[]>(collection?.variables ?? []);

	useEffect(() => {
		if (open) setLocal(collection?.variables ?? []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, collection?.id]);

	function handleChange(next: Variable[]) {
		setLocal(next);
		if (collection) void updateCollection(collection.id, { variables: next });
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title={collection ? `Variables — ${collection.name}` : "Collection Variables"}
			description="Scoped to this collection only. These take priority over environment and global variables with the same name."
			className="max-w-2xl"
		>
			<VariableTable variables={local} onChange={handleChange} onAdd={() => handleChange([...local, createVariable()])} />
		</Dialog>
	);
}
