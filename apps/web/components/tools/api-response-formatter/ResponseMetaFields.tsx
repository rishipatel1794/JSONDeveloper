import type { ReactNode } from "react";

import type { ResponseMeta } from "@/lib/tools/api-response-formatter/types";

interface ResponseMetaFieldsProps {
	meta: ResponseMeta;
	onChange: (meta: ResponseMeta) => void;
}

function FieldLabel({ children }: { children: ReactNode }) {
	return <label className="mb-1 block text-xs font-medium text-muted-foreground">{children}</label>;
}

const inputClass =
	"w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ResponseMetaFields({ meta, onChange }: ResponseMetaFieldsProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div>
				<FieldLabel>HTTP status code (optional)</FieldLabel>
				<input
					type="number"
					inputMode="numeric"
					value={meta.statusCode ?? ""}
					onChange={event => onChange({ ...meta, statusCode: event.target.value ? Number(event.target.value) : undefined })}
					placeholder="200"
					className={inputClass}
				/>
			</div>
			<div>
				<FieldLabel>HTTP method (optional)</FieldLabel>
				<select
					value={meta.method ?? ""}
					onChange={event => onChange({ ...meta, method: event.target.value || undefined })}
					className={inputClass}
				>
					<option value="">—</option>
					{["GET", "POST", "PUT", "PATCH", "DELETE"].map(method => (
						<option key={method} value={method}>
							{method}
						</option>
					))}
				</select>
			</div>
			<div>
				<FieldLabel>Content-Type (optional)</FieldLabel>
				<input
					type="text"
					value={meta.contentType ?? ""}
					onChange={event => onChange({ ...meta, contentType: event.target.value || undefined })}
					placeholder="application/json"
					className={inputClass}
				/>
			</div>
			<div>
				<FieldLabel>Endpoint URL (display only, optional)</FieldLabel>
				<input
					type="text"
					value={meta.endpointUrl ?? ""}
					onChange={event => onChange({ ...meta, endpointUrl: event.target.value || undefined })}
					placeholder="https://api.example.com/users"
					className={inputClass}
				/>
			</div>
			<div className="sm:col-span-2 lg:col-span-4">
				<FieldLabel>Response headers (optional, one per line)</FieldLabel>
				<textarea
					value={meta.headers ?? ""}
					onChange={event => onChange({ ...meta, headers: event.target.value || undefined })}
					placeholder={"Content-Type: application/json\nX-RateLimit-Remaining: 59"}
					rows={2}
					className={`${inputClass} font-mono`}
				/>
			</div>
		</div>
	);
}
