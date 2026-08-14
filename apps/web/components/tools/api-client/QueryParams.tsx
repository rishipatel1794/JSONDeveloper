import { KeyValueEditor } from "@/components/tools/shared/KeyValueEditor";
import type { KeyValuePair } from "@/lib/tools/shared/http";

interface QueryParamsProps {
	items: KeyValuePair[];
	onChange: (items: KeyValuePair[]) => void;
}

export function QueryParams({ items, onChange }: QueryParamsProps) {
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
