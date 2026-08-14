import { ToolAlert } from "@/components/tools/shared/ToolAlert";

interface RegexErrorProps {
	message: string;
}

export function RegexError({ message }: RegexErrorProps) {
	return (
		<ToolAlert variant="error" title="Invalid regular expression">
			{message}
		</ToolAlert>
	);
}
