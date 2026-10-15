export type StatusCategory = "informational" | "success" | "redirection" | "client-error" | "server-error";

export interface ApiExample {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	status: number;
	body?: unknown;
}

export interface StatusCode {
	code: number;
	title: string;
	category: StatusCategory;
	description: string;
	whenToUse: string;
	commonCauses: string[];
	apiExample?: ApiExample;
	developerTip: string;
	/** False for a code that is non-standard, deprecated, reserved/unused, or not a mandatory internet standard. */
	standardStatus: boolean;
	/** Codes from the data set this one is frequently confused with or compared against. */
	relatedCodes?: number[];
}

export const CATEGORY_LABELS: Record<StatusCategory, string> = {
	informational: "1xx Informational",
	success: "2xx Success",
	redirection: "3xx Redirection",
	"client-error": "4xx Client Error",
	"server-error": "5xx Server Error",
};
