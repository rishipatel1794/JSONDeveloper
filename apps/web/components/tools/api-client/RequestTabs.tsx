import { TabList } from "@/components/ui/Tabs";

export type RequestTabValue = "params" | "auth" | "headers" | "body";

interface RequestTabsProps {
	value: RequestTabValue;
	onChange: (value: RequestTabValue) => void;
	paramCount: number;
	headerCount: number;
}

export function RequestTabs({ value, onChange, paramCount, headerCount }: RequestTabsProps) {
	return (
		<TabList
			aria-label="Request configuration"
			value={value}
			onChange={next => onChange(next as RequestTabValue)}
			items={[
				{ value: "params", label: paramCount > 0 ? `Params (${paramCount})` : "Params" },
				{ value: "auth", label: "Authorization" },
				{ value: "headers", label: headerCount > 0 ? `Headers (${headerCount})` : "Headers" },
				{ value: "body", label: "Body" },
			]}
		/>
	);
}
