import { ToolAlert } from "@/components/tools/shared/ToolAlert";

interface SqlErrorProps {
	message: string;
}

export function SqlError({ message }: SqlErrorProps) {
	return (
		<ToolAlert variant="error" title="Unable to format SQL">
			{message}
		</ToolAlert>
	);
}
