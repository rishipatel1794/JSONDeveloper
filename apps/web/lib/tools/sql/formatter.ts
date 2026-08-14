import { format } from "sql-formatter";

import type { SqlFormatOptions, SqlFormatResult } from "./types";
import { minifySqlText } from "./utils";

// The library's own default (50) is narrow enough that similarly-shaped rows in a VALUES list
// (or CASE/argument lists) inconsistently wrap depending on content length — e.g. some tuples in a
// multi-row INSERT stay on one line while others explode across several, which reads as broken
// rather than formatted. A wider budget keeps typical rows/expressions on one line consistently.
const EXPRESSION_WIDTH = 120;

export function formatSql(sql: string, options: SqlFormatOptions): SqlFormatResult {
	if (!sql.trim()) {
		return { success: false, error: "Please enter a SQL query to format." };
	}

	try {
		const data = format(sql, {
			language: options.dialect,
			keywordCase: options.keywordCase,
			tabWidth: options.tabWidth,
			expressionWidth: EXPRESSION_WIDTH,
		});

		return { success: true, data };
	} catch {
		return {
			success: false,
			error: "Unable to format this query with the selected dialect. It may contain syntax that isn't supported.",
		};
	}
}

export function minifySql(sql: string): SqlFormatResult {
	if (!sql.trim()) {
		return { success: false, error: "Please enter a SQL query to minify." };
	}

	try {
		return { success: true, data: minifySqlText(sql) };
	} catch {
		return { success: false, error: "Unable to minify this query." };
	}
}
