const SECTIONS = [
	{
		title: "What is a SQL Formatter?",
		body: "A SQL formatter rewrites a query's whitespace, indentation, and keyword casing to make it easier to read, without changing what the query does. It's a text transformation tool, not a database client — it never runs your query.",
	},
	{
		title: "Why format SQL queries?",
		body: "Dense, single-line SQL is hard to review, debug, and diff in version control. Consistent formatting makes clause boundaries (SELECT, FROM, WHERE, JOIN) visually obvious, which speeds up code review and reduces mistakes when queries grow complex.",
	},
	{
		title: "SQL formatting examples",
		body: "A query like SELECT id,name FROM users WHERE status='active'; becomes a clause-per-line layout with consistent indentation — the same transformation the Load Example menu above demonstrates for joins, aggregates, and CTEs.",
	},
	{
		title: "PostgreSQL formatting",
		body: "PostgreSQL is the default dialect here. It correctly formats Postgres-specific syntax like the ->> and -> JSON operators and the @> containment operator without breaking them apart.",
	},
	{
		title: "MySQL formatting",
		body: "Switching the dialect selector to MySQL or MariaDB adjusts formatting for their specific syntax and keyword set, such as backtick-quoted identifiers.",
	},
	{
		title: "SQL JOIN formatting",
		body: "JOIN and LEFT JOIN clauses are placed on their own line with their ON condition indented beneath the FROM clause, making multi-table queries easier to scan.",
	},
	{
		title: "SQL GROUP BY formatting",
		body: "GROUP BY columns are placed on their own indented lines when there are multiple columns, mirroring how SELECT columns are laid out.",
	},
	{
		title: "SQL CTE formatting",
		body: "Common table expressions (WITH ... AS (...)) are indented as a nested block, so the boundary between the CTE definition and the outer query stays clear even when the CTE itself contains its own joins and filters.",
	},
	{
		title: "SQL best practices",
		body: "Beyond formatting, favor explicit column lists over SELECT *, use table aliases consistently, and keep one clause per line for anything beyond a trivial query — all of which this formatter's output already encourages.",
	},
];

export function SqlSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Formatting SQL queries</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
