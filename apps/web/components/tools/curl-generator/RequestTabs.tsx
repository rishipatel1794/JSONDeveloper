import { TabList } from "@/components/ui/Tabs";

export type RequestTabValue = "query" | "headers" | "body" | "auth";

interface RequestTabsProps {
	value: RequestTabValue;
	onChange: (value: RequestTabValue) => void;
	queryCount: number;
	headerCount: number;
}

export function RequestTabs({ value, onChange, queryCount, headerCount }: RequestTabsProps) {
	return (
		<TabList
			aria-label="Request configuration"
			value={value}
			onChange={next => onChange(next as RequestTabValue)}
			items={[
				{ value: "query", label: queryCount > 0 ? `Query (${queryCount})` : "Query" },
				{ value: "headers", label: headerCount > 0 ? `Headers (${headerCount})` : "Headers" },
				{ value: "body", label: "Body" },
				{ value: "auth", label: "Auth" },
			]}
		/>
	);
}
