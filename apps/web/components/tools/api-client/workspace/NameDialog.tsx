"use client";

import { useEffect, useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface NameDialogProps {
	open: boolean;
	title: string;
	nameLabel?: string;
	initialName?: string;
	showDescription?: boolean;
	initialDescription?: string;
	confirmLabel?: string;
	onCancel: () => void;
	onConfirm: (name: string, description?: string) => void;
}

export function NameDialog({
	open,
	title,
	nameLabel = "Name",
	initialName = "",
	showDescription = false,
	initialDescription = "",
	confirmLabel = "Save",
	onCancel,
	onConfirm,
}: NameDialogProps) {
	const [name, setName] = useState(initialName);
	const [description, setDescription] = useState(initialDescription);
	const [error, setError] = useState("");

	useEffect(() => {
		if (open) {
			setName(initialName);
			setDescription(initialDescription);
			setError("");
		}
		// Only re-sync when the dialog opens, not on every parent re-render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	function handleConfirm() {
		const trimmed = name.trim();
		if (!trimmed) {
			setError("Name is required.");
			return;
		}
		onConfirm(trimmed, showDescription ? description.trim() || undefined : undefined);
	}

	return (
		<Dialog open={open} onClose={onCancel} title={title}>
			<div className="space-y-3">
				<label className="block">
					<span className="mb-1 block text-xs font-medium text-muted-foreground">{nameLabel}</span>
					<input
						type="text"
						value={name}
						onChange={event => {
							setName(event.target.value);
							if (error) setError("");
						}}
						onKeyDown={event => {
							if (event.key === "Enter") handleConfirm();
						}}
						autoFocus
						className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
					{error && <p className="mt-1 text-xs text-destructive">{error}</p>}
				</label>

				{showDescription && (
					<label className="block">
						<span className="mb-1 block text-xs font-medium text-muted-foreground">Description (optional)</span>
						<textarea
							value={description}
							onChange={event => setDescription(event.target.value)}
							rows={2}
							className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
					</label>
				)}
			</div>

			<div className="mt-5 flex justify-end gap-2">
				<Button onClick={onCancel} variant="ghost">
					Cancel
				</Button>
				<Button onClick={handleConfirm}>{confirmLabel}</Button>
			</div>
		</Dialog>
	);
}
