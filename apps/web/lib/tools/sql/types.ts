export type SqlDialect = "postgresql" | "mysql" | "mariadb" | "sqlite" | "transactsql" | "plsql" | "sql";

export interface SqlDialectOption {
	value: SqlDialect;
	label: string;
}

/** Curated to dialects actually supported by the installed sql-formatter library (see supportedDialects). */
export const SQL_DIALECTS: SqlDialectOption[] = [
	{ value: "postgresql", label: "PostgreSQL" },
	{ value: "mysql", label: "MySQL" },
	{ value: "mariadb", label: "MariaDB" },
	{ value: "sqlite", label: "SQLite" },
	{ value: "transactsql", label: "Transact-SQL" },
	{ value: "plsql", label: "PL/SQL" },
	{ value: "sql", label: "Standard SQL" },
];

export type KeywordCase = "preserve" | "upper" | "lower";

export const KEYWORD_CASES: { value: KeywordCase; label: string }[] = [
	{ value: "upper", label: "UPPERCASE" },
	{ value: "lower", label: "lowercase" },
	{ value: "preserve", label: "Preserve" },
];

export const INDENT_SIZES = [2, 4] as const;

export interface SqlFormatOptions {
	dialect: SqlDialect;
	keywordCase: KeywordCase;
	tabWidth: number;
}

export interface SqlFormatResult {
	success: boolean;
	data?: string;
	error?: string;
}

export interface SqlExample {
	name: string;
	dialect: SqlDialect;
	sql: string;
}
