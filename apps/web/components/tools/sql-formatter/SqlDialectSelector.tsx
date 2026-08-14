import { SQL_DIALECTS, type SqlDialect } from "@/lib/tools/sql/types";

interface SqlDialectSelectorProps {
	value: SqlDialect;
	onChange: (value: SqlDialect) => void;
}

export function SqlDialectSelector({ value, onChange }: SqlDialectSelectorProps) {
	return (
		<div>
			<label htmlFor="sql-dialect" className="mb-1.5 block text-sm font-medium">
				SQL Dialect
			</label>
			<select
				id="sql-dialect"
				value={value}
				onChange={event => onChange(event.target.value as SqlDialect)}
				className="h-10 w-full max-w-xs rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{SQL_DIALECTS.map(dialect => (
					<option key={dialect.value} value={dialect.value}>
						{dialect.label}
					</option>
				))}
			</select>
		</div>
	);
}
