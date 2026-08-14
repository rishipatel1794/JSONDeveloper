"use client";

import { useEffect, useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { createVariable, setGlobalVariables } from "@/lib/api-client/storage/variables";
import type { Variable } from "@/lib/api-client/workspace/types";

import { VariableTable } from "./VariableTable";

interface GlobalVariablesDialogProps {
	open: boolean;
	variables: Variable[];
	onClose: () => void;
}

export function GlobalVariablesDialog({ open, variables, onClose }: GlobalVariablesDialogProps) {
	const [local, setLocal] = useState<Variable[]>(variables);

	useEffect(() => {
		if (open) setLocal(variables);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	function handleChange(next: Variable[]) {
		setLocal(next);
		void setGlobalVariables(next);
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title="Global Variables"
			description="Available to every request, in every collection and environment. Collection and environment variables override these when a name conflicts."
			className="max-w-2xl"
		>
			<VariableTable variables={local} onChange={handleChange} onAdd={() => handleChange([...local, createVariable()])} />
		</Dialog>
	);
}
