import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	destructive?: boolean;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Delete", onConfirm, onCancel, destructive = true }: ConfirmDialogProps) {
	return (
		<Dialog open={open} onClose={onCancel} title={title}>
			<p className="text-sm text-muted-foreground">{description}</p>

			<div className="mt-5 flex justify-end gap-2">
				<Button onClick={onCancel} variant="ghost">
					Cancel
				</Button>
				<Button onClick={onConfirm} className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive-hover" : undefined}>
					{confirmLabel}
				</Button>
			</div>
		</Dialog>
	);
}
