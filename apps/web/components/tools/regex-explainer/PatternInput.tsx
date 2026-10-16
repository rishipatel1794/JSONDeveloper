import { RegexInput } from "@/components/tools/regex-tester/RegexInput";

interface PatternInputProps {
	pattern: string;
	onChange: (value: string) => void;
}

export function PatternInput({ pattern, onChange }: PatternInputProps) {
	return (
		<div>
			<p className="mb-2 text-sm font-medium">Regular expression</p>
			<RegexInput pattern={pattern} onChange={onChange} onTest={() => {}} />
		</div>
	);
}
