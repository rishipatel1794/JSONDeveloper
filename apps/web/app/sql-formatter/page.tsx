import { Database } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { FAQ_ITEMS, SqlFaq } from "@/components/tools/sql-formatter/SqlFaq";
import { SqlFormatter } from "@/components/tools/sql-formatter/SqlFormatter";
import { SqlSeoContent } from "@/components/tools/sql-formatter/SqlSeoContent";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";

const TITLE = "SQL Formatter — Format SQL Queries Online";
const DESCRIPTION =
	"Format and beautify SQL queries online with PostgreSQL, MySQL, MariaDB, SQLite, Transact-SQL, PL/SQL, and standard SQL dialect support.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/sql-formatter",
	keywords: ["sql formatter", "sql beautifier", "format sql query"],
});

const jsonLd = getToolJsonLd({ name: "SQL Formatter", description: DESCRIPTION, path: "/sql-formatter" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function SqlFormatterPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
			<RelatedTools
				tools={[
					{ name: "JSON Formatter", href: "/json-formatter", description: "Format, validate, minify, and download JSON instantly." },
					{ name: "Code Diff", href: "/code-diff", description: "Compare two versions of code and see exactly what changed." },
					{ name: "Regex Tester", href: "/regex-tester", description: "Test and debug regular expressions instantly." },
				]}
			/>
		</main>
	);
}
