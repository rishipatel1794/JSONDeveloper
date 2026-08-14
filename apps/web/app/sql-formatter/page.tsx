import type { Metadata } from "next";
import { Database } from "lucide-react";

import { SqlFaq } from "@/components/tools/sql-formatter/SqlFaq";
import { SqlFormatter } from "@/components/tools/sql-formatter/SqlFormatter";
import { SqlSeoContent } from "@/components/tools/sql-formatter/SqlSeoContent";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata: Metadata = {
	title: "SQL Formatter — Format SQL Queries Online",
	description:
		"Format and beautify SQL queries online with PostgreSQL, MySQL, MariaDB, SQLite, Transact-SQL, PL/SQL, and standard SQL dialect support.",
};

export default function SqlFormatterPage() {
	return (
		<main>
			<div className="container mx-auto max-w-7xl px-4 py-10">
				<ToolPageHeader
					icon={Database}
					title="SQL Formatter"
					description="Format and beautify SQL queries directly in your browser."
				/>

				<SqlFormatter />
			</div>

			<SqlSeoContent />
			<SqlFaq />
		</main>
	);
}
