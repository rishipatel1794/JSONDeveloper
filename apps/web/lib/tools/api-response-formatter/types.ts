import type { JsonValue } from "@/lib/tools/json-validator/types";

export interface ResponseMeta {
	statusCode?: number;
	method?: string;
	contentType?: string;
	headers?: string;
	endpointUrl?: string;
}

export type FindingTone = "positive" | "observation";

export interface AnalysisFinding {
	id: string;
	tone: FindingTone;
	title: string;
	detail: string;
}

export interface StructureSummary {
	rootType: "object" | "array" | "string" | "number" | "boolean" | "null";
	totalKeys: number;
	objectCount: number;
	arrayCount: number;
	maxDepth: number;
	approxSizeBytes: number;
}

export type { JsonValue };
