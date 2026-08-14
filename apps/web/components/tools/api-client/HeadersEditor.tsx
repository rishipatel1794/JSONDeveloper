import { KeyValueEditor } from "@/components/tools/shared/KeyValueEditor";
import type { KeyValuePair } from "@/lib/tools/shared/http";

interface HeadersEditorProps {
	items: KeyValuePair[];
	onChange: (items: KeyValuePair[]) => void;
}

export function HeadersEditor({ items, onChange }: HeadersEditorProps) {
	return (
		<KeyValueEditor
			items={items}
			onChange={onChange}
			keyPlaceholder="Header"
			valuePlaceholder="Value"
			addLabel="Add Header"
			aria-label="Request headers"
		/>
	);
}
