import { CopyButton } from "@/components/ui/CopyButton";

interface ResponseHeadersProps {
	headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
	const entries = Object.entries(headers);

	if (entries.length === 0) {
		return <p className="p-4 text-sm text-muted-foreground">No response headers.</p>;
	}

	return (
		<div className="overflow-x-auto rounded-md border border-border">
			<table className="w-full text-sm">
				<caption className="sr-only">Response headers</caption>
				<thead>
					<tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-subtle-foreground">
						<th scope="col" className="px-4 py-2 font-medium">
							Header
						</th>
						<th scope="col" className="px-4 py-2 font-medium">
							Value
						</th>
						<th scope="col" className="px-4 py-2 font-medium">
							<span className="sr-only">Copy</span>
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border-subtle">
					{entries.map(([key, value]) => (
						<tr key={key}>
							<th scope="row" className="whitespace-nowrap px-4 py-2.5 text-left font-mono text-xs font-medium text-primary-accent">
								{key}
							</th>
							<td className="max-w-md break-all px-4 py-2.5 font-mono text-xs text-foreground">{value}</td>
							<td className="px-4 py-2.5 text-right">
								<CopyButton value={value} label="" ariaLabel={`Copy ${key} header value`} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
