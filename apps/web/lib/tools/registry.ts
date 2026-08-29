import {
	Braces,
	CalendarClock,
	Code2,
	Container,
	Database,
	FileCode2,
	Fingerprint,
	Globe,
	KeyRound,
	Regex,
	Send,
	ShieldCheck,
	Terminal,
	Wrench,
	type LucideIcon,
} from "lucide-react";

import { productConfig } from "@repo/config";

export type CategorySlug = "json" | "api" | "regex" | "database" | "web" | "utilities" | "devops";

export interface CategoryDefinition {
	slug: CategorySlug;
	name: string;
	description: string;
	icon: LucideIcon;
}

export interface ToolDefinition {
	name: string;
	slug: string;
	href: string;
	description: string;
	category: CategorySlug;
	icon: LucideIcon;
	popular?: boolean;
	available?: boolean;
}

export const categories: CategoryDefinition[] = [
	{
		slug: "json",
		name: "JSON",
		description: "Format, validate, and transform JSON data.",
		icon: Braces,
	},
	{
		slug: "api",
		name: "API",
		description: "Decode tokens, generate requests, and inspect responses.",
		icon: KeyRound,
	},
	{
		slug: "regex",
		name: "Regex",
		description: "Test, generate, and understand regular expressions.",
		icon: Regex,
	},
	{
		slug: "database",
		name: "Database",
		description: "Format and validate SQL, and convert between formats.",
		icon: Database,
	},
	{
		slug: "web",
		name: "Web",
		description: "Encode, decode, and format everyday web formats.",
		icon: Globe,
	},
	{
		slug: "utilities",
		name: "Utilities",
		description: "Generators and converters for common dev tasks.",
		icon: Wrench,
	},
	{
		slug: "devops",
		name: "DevOps",
		description: "Config generators for servers and containers.",
		icon: Container,
	},
];

const allTools: ToolDefinition[] = [
	// JSON
	{
		name: "JSON Formatter",
		slug: "json-formatter",
		href: "/json-formatter",
		description: "Format, validate, minify, and download JSON instantly.",
		category: "json",
		icon: Braces,
		popular: true,
		available: true,
	},
	{
		name: "JSON Validator",
		slug: "json-validator",
		href: "/json-validator",
		description: "Validate JSON, debug syntax errors, detect duplicate keys, and analyze structure.",
		category: "json",
		icon: ShieldCheck,
		popular: true,
		available: true,
	},
	{
		name: "JSON Minifier",
		slug: "json-minifier",
		href: "/tools/json-minifier",
		description: "Compress JSON by removing whitespace.",
		category: "json",
		icon: Braces,
	},
	{
		name: "JSON to TypeScript",
		slug: "json-to-typescript",
		href: "/tools/json-to-typescript",
		description: "Generate TypeScript interfaces from JSON.",
		category: "json",
		icon: FileCode2,
	},
	{
		name: "JSON to Zod",
		slug: "json-to-zod",
		href: "/tools/json-to-zod",
		description: "Generate Zod schemas from JSON.",
		category: "json",
		icon: FileCode2,
	},
	{
		name: "JSON to Python",
		slug: "json-to-python",
		href: "/tools/json-to-python",
		description: "Generate Python dataclasses from JSON.",
		category: "json",
		icon: FileCode2,
	},
	{
		name: "JSON to PHP",
		slug: "json-to-php",
		href: "/tools/json-to-php",
		description: "Generate PHP arrays or classes from JSON.",
		category: "json",
		icon: FileCode2,
	},
	{
		name: "JSON to Java",
		slug: "json-to-java",
		href: "/tools/json-to-java",
		description: "Generate Java classes from JSON.",
		category: "json",
		icon: FileCode2,
	},

	// API
	{
		name: "API Client",
		slug: "api-client",
		href: "/api-client",
		description: "Send and inspect HTTP API requests directly from your browser.",
		category: "api",
		icon: Send,
		popular: true,
		available: true,
	},
	{
		name: "JWT Decoder",
		slug: "jwt-decoder",
		href: "/jwt-decoder",
		description: "Decode and inspect JSON Web Tokens locally.",
		category: "api",
		icon: KeyRound,
		popular: true,
		available: true,
	},
	{
		name: "JWT Generator",
		slug: "jwt-generator",
		href: "/tools/jwt-generator",
		description: "Create signed JSON Web Tokens for testing.",
		category: "api",
		icon: KeyRound,
	},
	{
		name: "cURL Generator",
		slug: "curl-generator",
		href: "/curl-generator",
		description: "Build and generate cURL commands for HTTP requests.",
		category: "api",
		icon: Terminal,
		popular: true,
		available: true,
	},
	{
		name: "HTTP Status Code Reference",
		slug: "http-status-codes",
		href: "/tools/http-status-codes",
		description: "Look up what each HTTP status code means.",
		category: "api",
		icon: KeyRound,
	},
	{
		name: "API Response Formatter",
		slug: "api-response-formatter",
		href: "/tools/api-response-formatter",
		description: "Pretty-print and inspect API responses.",
		category: "api",
		icon: KeyRound,
	},

	// Regex
	{
		name: "Regex Tester",
		slug: "regex-tester",
		href: "/regex-tester",
		description: "Test and debug regular expressions instantly.",
		category: "regex",
		icon: Regex,
		popular: true,
		available: true,
	},
	{
		name: "Regex Generator",
		slug: "regex-generator",
		href: "/tools/regex-generator",
		description: "Generate a regex pattern from examples.",
		category: "regex",
		icon: Regex,
	},
	{
		name: "Regex Explainer",
		slug: "regex-explainer",
		href: "/tools/regex-explainer",
		description: "Get a plain-English breakdown of a regex.",
		category: "regex",
		icon: Regex,
	},

	// Database
	{
		name: "SQL Formatter",
		slug: "sql-formatter",
		href: "/sql-formatter",
		description: "Format and beautify SQL queries instantly.",
		category: "database",
		icon: Database,
		popular: true,
		available: true,
	},
	{
		name: "SQL Validator",
		slug: "sql-validator",
		href: "/tools/sql-validator",
		description: "Check SQL syntax for errors.",
		category: "database",
		icon: Database,
	},
	{
		name: "JSON to SQL",
		slug: "json-to-sql",
		href: "/tools/json-to-sql",
		description: "Generate SQL insert statements from JSON.",
		category: "database",
		icon: Database,
	},
	{
		name: "SQL Explainer",
		slug: "sql-explainer",
		href: "/tools/sql-explainer",
		description: "Get a plain-English breakdown of a SQL query.",
		category: "database",
		icon: Database,
	},

	// Web
	{
		name: "URL Encoder",
		slug: "url-encoder",
		href: "/tools/url-encoder",
		description: "Percent-encode URLs and query strings.",
		category: "web",
		icon: Globe,
	},
	{
		name: "URL Decoder",
		slug: "url-decoder",
		href: "/tools/url-decoder",
		description: "Decode percent-encoded URLs.",
		category: "web",
		icon: Globe,
	},
	{
		name: "HTML Formatter",
		slug: "html-formatter",
		href: "/tools/html-formatter",
		description: "Format and beautify HTML markup.",
		category: "web",
		icon: Code2,
	},
	{
		name: "CSS Formatter",
		slug: "css-formatter",
		href: "/tools/css-formatter",
		description: "Format and beautify CSS stylesheets.",
		category: "web",
		icon: Code2,
	},
	{
		name: "JavaScript Formatter",
		slug: "javascript-formatter",
		href: "/tools/javascript-formatter",
		description: "Format and beautify JavaScript code.",
		category: "web",
		icon: Code2,
	},

	// Utilities
	{
		name: "Base64 Encoder",
		slug: "base64-encoder",
		href: "/tools/base64-encoder",
		description: "Encode text or files to Base64.",
		category: "utilities",
		icon: Fingerprint,
	},
	{
		name: "Base64 Decoder",
		slug: "base64-decoder",
		href: "/tools/base64-decoder",
		description: "Decode Base64 back to text or files.",
		category: "utilities",
		icon: Fingerprint,
	},
	{
		name: "UUID Generator",
		slug: "uuid-generator",
		href: "/tools/uuid-generator",
		description: "Generate v4 UUIDs in bulk.",
		category: "utilities",
		icon: Fingerprint,
	},
	{
		name: "Timestamp Converter",
		slug: "timestamp-converter",
		href: "/timestamp-converter",
		description: "Convert, inspect, and debug Unix timestamps, dates, and timezones.",
		category: "utilities",
		icon: CalendarClock,
		popular: true,
		available: true,
	},
	{
		name: "Hash Generator",
		slug: "hash-generator",
		href: "/tools/hash-generator",
		description: "Generate MD5, SHA-1, and SHA-256 hashes.",
		category: "utilities",
		icon: Fingerprint,
	},
	{
		name: "Text Diff",
		slug: "text-diff",
		href: "/tools/text-diff",
		description: "Compare two blocks of text side by side.",
		category: "utilities",
		icon: Wrench,
	},

	// DevOps
	{
		name: "Cron Generator",
		slug: "cron-generator",
		href: "/tools/cron-generator",
		description: "Build cron expressions from a schedule.",
		category: "devops",
		icon: Terminal,
	},
	{
		name: "Cron Parser",
		slug: "cron-parser",
		href: "/tools/cron-parser",
		description: "Explain what a cron expression does.",
		category: "devops",
		icon: Terminal,
	},
	{
		name: ".htaccess Generator",
		slug: "htaccess-generator",
		href: "/tools/htaccess-generator",
		description: "Generate Apache .htaccess rules.",
		category: "devops",
		icon: Container,
	},
	{
		name: "Nginx Config Generator",
		slug: "nginx-config-generator",
		href: "/tools/nginx-config-generator",
		description: "Generate Nginx server block configs.",
		category: "devops",
		icon: Container,
	},
	{
		name: "Docker Compose Generator",
		slug: "docker-compose-generator",
		href: "/tools/docker-compose-generator",
		description: "Generate docker-compose.yml files.",
		category: "devops",
		icon: Container,
	},
];

export const isProductionAppMode = productConfig.isProduction;

export const tools: ToolDefinition[] = isProductionAppMode
	? allTools.filter(tool => tool.available)
	: allTools;

export const popularTools = tools.filter(tool => tool.popular);

export function getToolsByCategory(category: CategorySlug): ToolDefinition[] {
	return tools.filter(tool => tool.category === category);
}

export function getCategoryToolCount(category: CategorySlug): number {
	return getToolsByCategory(category).length;
}
