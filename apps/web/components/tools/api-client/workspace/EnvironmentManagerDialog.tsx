"use client";

import { useEffect, useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";

import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import {
	createEnvironment,
	deleteEnvironment,
	duplicateEnvironment,
	updateEnvironment,
} from "@/lib/api-client/storage/environments";
import { createVariable } from "@/lib/api-client/storage/variables";
import type { Environment, Variable } from "@/lib/api-client/workspace/types";
import { cn } from "@/lib/utils";

import { NameDialog } from "./NameDialog";
import { VariableTable } from "./VariableTable";

interface EnvironmentManagerDialogProps {
	open: boolean;
	environments: Environment[];
	onClose: () => void;
	onReload: () => void;
}

export function EnvironmentManagerDialog({ open, environments, onClose, onReload }: EnvironmentManagerDialogProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showCreate, setShowCreate] = useState(false);
	const [renameTarget, setRenameTarget] = useState<Environment | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Environment | null>(null);

	useEffect(() => {
		if (open && !selectedId && environments.length > 0) {
			setSelectedId(environments[0]?.id ?? null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, environments]);

	const selected = environments.find(environment => environment.id === selectedId) ?? null;

	async function handleCreate(name: string) {
		const created = await createEnvironment(name);
		onReload();
		setSelectedId(created.id);
		setShowCreate(false);
	}

	async function handleVariablesChange(next: Variable[]) {
		if (!selected) return;
		await updateEnvironment(selected.id, { variables: next });
		onReload();
	}

	async function handleDuplicate(environment: Environment) {
		const copy = await duplicateEnvironment(environment.id);
		onReload();
		if (copy) setSelectedId(copy.id);
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		await deleteEnvironment(deleteTarget.id);
		if (selectedId === deleteTarget.id) setSelectedId(null);
		setDeleteTarget(null);
		onReload();
	}

	async function handleRename(name: string) {
		if (!renameTarget) return;
		await updateEnvironment(renameTarget.id, { name });
		setRenameTarget(null);
		onReload();
	}

	return (
		<>
			<Dialog open={open} onClose={onClose} title="Environments" className="max-w-3xl">
				<div className="grid gap-4 sm:grid-cols-[180px_1fr]">
					<div className="space-y-1">
						{environments.map(environment => (
							<button
								key={environment.id}
								type="button"
								onClick={() => setSelectedId(environment.id)}
								className={cn(
									"flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm",
									environment.id === selectedId ? "bg-primary/10 text-primary-accent" : "text-foreground hover:bg-secondary",
								)}
							>
								<span className="truncate">{environment.name}</span>
							</button>
						))}

						<Button onClick={() => setShowCreate(true)} variant="outline" size="sm" className="mt-2 w-full">
							<Plus className="size-3.5" />
							New Environment
						</Button>
					</div>

					<div>
						{selected ? (
							<div>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-foreground">{selected.name}</h3>
									<div className="flex items-center gap-1">
										<button
											type="button"
											onClick={() => setRenameTarget(selected)}
											aria-label="Rename environment"
											className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
										>
											<Pencil className="size-3.5" />
										</button>
										<button
											type="button"
											onClick={() => handleDuplicate(selected)}
											aria-label="Duplicate environment"
											className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
										>
											<Copy className="size-3.5" />
										</button>
										<button
											type="button"
											onClick={() => setDeleteTarget(selected)}
											aria-label="Delete environment"
											className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive-muted hover:text-destructive"
										>
											<Trash2 className="size-3.5" />
										</button>
									</div>
								</div>

								<VariableTable
									variables={selected.variables}
									onChange={handleVariablesChange}
									onAdd={() => handleVariablesChange([...selected.variables, createVariable()])}
								/>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								{environments.length === 0 ? "Create an environment to get started." : "Select an environment."}
							</p>
						)}
					</div>
				</div>
			</Dialog>

			<NameDialog
				open={showCreate}
				title="New Environment"
				nameLabel="Name"
				confirmLabel="Create"
				onCancel={() => setShowCreate(false)}
				onConfirm={handleCreate}
			/>

			<NameDialog
				open={Boolean(renameTarget)}
				title="Rename Environment"
				nameLabel="Name"
				initialName={renameTarget?.name ?? ""}
				confirmLabel="Rename"
				onCancel={() => setRenameTarget(null)}
				onConfirm={handleRename}
			/>

			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title={`Delete "${deleteTarget?.name}"?`}
				description="This will permanently delete this environment and its variables. Requests using {{variables}} defined here will show them as undefined until you select a different environment."
				onCancel={() => setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</>
	);
}
