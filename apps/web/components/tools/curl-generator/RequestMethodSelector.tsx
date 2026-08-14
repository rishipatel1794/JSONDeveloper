import { HTTP_METHODS, type HttpMethod } from "@/lib/tools/curl/types";

interface RequestMethodSelectorProps {
	value: HttpMethod;
	onChange: (value: HttpMethod) => void;
}

export function RequestMethodSelector({ value, onChange }: RequestMethodSelectorProps) {
	return (
		<label className="inline-flex items-center">
			<span className="sr-only">HTTP method</span>
			<select
				value={value}
				onChange={event => onChange(event.target.value as HttpMethod)}
				className="h-11 shrink-0 rounded-md border border-border bg-card px-3 text-sm font-semibold text-primary-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{HTTP_METHODS.map(method => (
					<option key={method} value={method}>
						{method}
					</option>
				))}
			</select>
		</label>
	);
}
