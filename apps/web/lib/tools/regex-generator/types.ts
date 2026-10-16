export interface RegexTemplate {
	id: string;
	label: string;
	pattern: string;
	flags: string;
	description: string;
	/** What this pattern deliberately does NOT guarantee — shown so it's never mistaken for full validation. */
	limitations: string[];
	examplesMatch: string[];
	examplesNoMatch: string[];
	/** A looser alternative pattern for templates where "strict" vs "practical" is a meaningful, common trade-off. */
	practicalVariant?: { pattern: string; description: string };
}

export type TemplateCategory = "common" | "text" | "numeric" | "datetime" | "web" | "identifiers";

export interface RequirementsOptions {
	minLength?: number;
	maxLength?: number;
	requireUppercase?: boolean;
	requireLowercase?: boolean;
	requireNumber?: boolean;
	requireSpecial?: boolean;
	startsWith?: string;
	endsWith?: string;
	allowedChars?: string;
	forbiddenChars?: string;
}

export interface RequirementsResult {
	pattern: string;
	warnings: string[];
}
