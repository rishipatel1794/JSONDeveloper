import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface UnsavedChangesDialogProps {
	open: boolean;
	onSave: () => void;
	onDiscard: () => void;
	onCancel: () => void;
}

export function UnsavedChangesDialog({ open, onSave, onDiscard, onCancel }: UnsavedChangesDialogProps) {
	return (
		<Dialog open={open} onClose={onCancel} title="You have unsaved changes">
			<p className="text-sm text-muted-foreground">Save your changes before opening another request?</p>

			<div className="mt-5 flex justify-end gap-2">
				<Button onClick={onCancel} variant="ghost">
					Cancel
				</Button>
				<Button onClick={onDiscard} variant="outline" className="text-destructive hover:bg-destructive-muted">
					Discard
				</Button>
				<Button onClick={onSave}>Save</Button>
			</div>
		</Dialog>
	);
}
