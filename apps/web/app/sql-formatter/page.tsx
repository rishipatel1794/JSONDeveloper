import { Database } from "lucide-react";

import { createToolMetadata } from "@/lib/seo";
import { SqlFaq } from "@/components/tools/sql-formatter/SqlFaq";
import { SqlFormatter } from "@/components/tools/sql-formatter/SqlFormatter";
import { SqlSeoContent } from "@/components/tools/sql-formatter/SqlSeoContent";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

export const metadata = createToolMetadata({
	title: "SQL Formatter — Format SQL Queries Online",
	description:
		"Format and beautify SQL queries online with PostgreSQL, MySQL, MariaDB, SQLite, Transact-SQL, PL/SQL, and standard SQL dialect support.",
	path: "/sql-formatter",
	keywords: ["sql formatter", "sql beautifier", "format sql query"],
});

export default function SqlFormatterPage() {
	return (
		<main>
			<ToolPageContainer wide>
				<ToolPageHeader
					icon={Database}
					title="SQL Formatter"
					description="Format and beautify SQL queries directly in your browser."
				/>

				<SqlFormatter />
			</ToolPageContainer>

			<SqlSeoContent />
			<SqlFaq />
		</main>
	);
}
