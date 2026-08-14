import type { SqlExample } from "./types";

const NO_SPACE_BEFORE = new Set([",", ";", ")"]);

/**
 * A conservative, string/comment-safe SQL minifier. The sql-formatter library only beautifies —
 * it has no "minify" mode — so this collapses whitespace and strips comments by hand while
 * tracking quote/comment state, so it never touches the contents of a string or identifier.
 */
export function minifySqlText(sql: string): string {
	let result = "";
	let pendingSpace = false;
	let i = 0;
	const n = sql.length;

	function flushPendingSpace(nextChar: string) {
		if (pendingSpace && result.length > 0 && !NO_SPACE_BEFORE.has(nextChar)) {
			result += " ";
		}
		pendingSpace = false;
	}

	while (i < n) {
		const ch = sql[i];
		if (ch === undefined) break;

		const next = sql[i + 1];

		// Line comment — stripped entirely (a collapsed newline would otherwise swallow the rest of the query into the comment).
		if (ch === "-" && next === "-") {
			i += 2;
			while (i < n && sql[i] !== "\n") i++;
			pendingSpace = true;
			continue;
		}

		// Block comment — stripped entirely.
		if (ch === "/" && next === "*") {
			i += 2;
			while (i < n && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
			i += 2;
			pendingSpace = true;
			continue;
		}

		// Quoted string or identifier — copied verbatim, including internal whitespace.
		if (ch === "'" || ch === '"') {
			flushPendingSpace(ch);
			const quote = ch;
			result += ch;
			i++;

			while (i < n) {
				if (sql[i] === quote && sql[i + 1] === quote) {
					result += quote + quote;
					i += 2;
					continue;
				}
				if (sql[i] === quote) {
					result += quote;
					i++;
					break;
				}
				result += sql[i];
				i++;
			}
			continue;
		}

		if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
			pendingSpace = true;
			i++;
			continue;
		}

		flushPendingSpace(ch);
		result += ch;
		if (ch === "(") pendingSpace = false;
		i++;
	}

	return result;
}

export const SQL_EXAMPLES: SqlExample[] = [
	{
		name: "Simple SELECT",
		dialect: "postgresql",
		sql: "SELECT id,name,email FROM users WHERE status='active';",
	},
	{
		name: "JOIN",
		dialect: "postgresql",
		sql: "SELECT u.name,o.total FROM users u JOIN orders o ON u.id=o.user_id;",
	},
	{
		name: "GROUP BY",
		dialect: "postgresql",
		sql: "SELECT department,COUNT(*) FROM employees GROUP BY department;",
	},
	{
		name: "CTE",
		dialect: "postgresql",
		sql: "WITH active_users AS (SELECT * FROM users WHERE status='active') SELECT * FROM active_users;",
	},
	{
		name: "PostgreSQL JSON",
		dialect: "postgresql",
		sql: "SELECT id,data->>'name' AS name FROM users WHERE data->>'status'='active';",
	},
	{
		name: "INSERT",
		dialect: "postgresql",
		sql: "INSERT INTO users(name,email) VALUES('John','john@example.com');",
	},
];
