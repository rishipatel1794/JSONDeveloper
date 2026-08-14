import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What is a SQL formatter?",
		answer:
			"A tool that rewrites a SQL query's whitespace, indentation, and keyword casing to make it easier to read, without changing its meaning.",
	},
	{
		question: "Does the SQL formatter execute my query?",
		answer: "No. The formatter only processes SQL text and does not execute queries against a database.",
	},
	{
		question: "Is my SQL uploaded?",
		answer:
			"No. Formatting is performed locally in your browser using JavaScript — your query is never sent to our backend or any external service.",
	},
	{
		question: "Which SQL databases are supported?",
		answer: "PostgreSQL, MySQL, MariaDB, SQLite, Transact-SQL, PL/SQL, and standard SQL formatting are supported.",
	},
	{
		question: "Can I format PostgreSQL queries?",
		answer:
			"Yes — PostgreSQL is the default dialect, including support for Postgres-specific syntax like the ->> JSON operator and array literals.",
	},
	{
		question: "Can I format multiple SQL statements?",
		answer: "Yes. Statements separated by semicolons are each formatted and separated by a blank line in the output.",
	},
	{
		question: "Can I download formatted SQL?",
		answer: "Yes — the Download button saves the formatted query as a .sql file generated entirely in your browser.",
	},
];

export function SqlFaq() {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>

				<div className="mt-8">
					<Accordion items={FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
