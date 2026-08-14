import { KeyValueEditor } from "@/components/tools/shared/KeyValueEditor";
import type { KeyValuePair } from "@/lib/tools/curl/types";

interface QueryParamsEditorProps {
	items: KeyValuePair[];
	onChange: (items: KeyValuePair[]) => void;
}

export function QueryParamsEditor({ items, onChange }: QueryParamsEditorProps) {
	return (
		<KeyValueEditor
			items={items}
			onChange={onChange}
			keyPlaceholder="Key"
			valuePlaceholder="Value"
			addLabel="Add Parameter"
			aria-label="Query parameters"
		/>
	);
}
