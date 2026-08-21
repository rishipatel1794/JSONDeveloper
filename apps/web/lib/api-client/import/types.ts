import type { AuthConfig, KeyValuePair } from "@/lib/tools/shared/http";

import type { ApiBodyType } from "../types";

export type OpenApiFormat = "json" | "yaml";
export type OpenApiVersion = "swagger2" | "openapi3.0" | "openapi3.1";

export interface ParsedSpecResult {
	success: boolean;
	document?: Record<string, unknown>;
	version?: OpenApiVersion;
	format?: OpenApiFormat;
	error?: string;
}

export interface ImportedServerVariable {
	name: string;
	default: string;
	enum?: string[];
}

export interface ImportedServer {
	label: string;
	/** Fully resolved (server variables substituted with their defaults) — safe to use directly as BASE_URL. */
	url: string;
	description?: string;
	variables: ImportedServerVariable[];
}

export type ImportedParamLocation = "path" | "query" | "header";

export interface ImportedParameter {
	name: string;
	in: ImportedParamLocation;
	required: boolean;
	value: string;
	description?: string;
}

export type ImportedAuth =
	| { type: "none" }
	| { type: "bearer" }
	| { type: "basic" }
	| { type: "api-key"; key: string; location: "header" | "query" };

export interface ImportedRequestBody {
	contentType: string;
	/** Raw generated/example value — shaped into a body string or formData pairs at workspace-mapping time. */
	value: unknown;
	bodyType: Extract<ApiBodyType, "json" | "raw" | "form-urlencoded">;
	/** True when `value` came from the spec's own example/examples/default rather than being synthesized from the schema type. */
	isExplicit: boolean;
}

export interface ImportedRequest {
	/** Stable synthetic id used for preview selection state — not the eventual storage id. */
	previewId: string;
	name: string;
	method: string;
	path: string;
	/** Path with {param} rewritten to {{param}}, no BASE_URL prefix yet. */
	url: string;
	tag?: string;
	operationId?: string;
	summary?: string;
	description?: string;
	deprecated: boolean;
	parameters: ImportedParameter[];
	body?: ImportedRequestBody;
	auth: ImportedAuth;
	supported: boolean;
	skipReason?: string;
}

export interface ImportedFolder {
	name: string;
	requests: ImportedRequest[];
}

export interface ImportedVariableSuggestion {
	name: string;
	secret: boolean;
	suggestedDefault?: string;
}

export interface SkippedEndpoint {
	method: string;
	path: string;
	reason: string;
}

export interface ImportedApiDefinition {
	title: string;
	version: string;
	description?: string;
	servers: ImportedServer[];
	folders: ImportedFolder[];
	suggestedVariables: ImportedVariableSuggestion[];
	skipped: SkippedEndpoint[];
	sourceFormat: OpenApiFormat;
	sourceVersion: OpenApiVersion;
}

// ---------------------------------------------------------------------------------------------
// "Direct" imports (Postman Collection, cURL) — unlike OpenAPI/Swagger, these sources describe
// requests with concrete, ready-to-use values (real auth tokens, fully-formed URLs) rather than a
// server + relative-path template, so there's no BASE_URL synthesis step: each request's url/auth/
// body is carried through to the saved request as-is.
// ---------------------------------------------------------------------------------------------

export interface DirectImportedRequest {
	/** Stable synthetic id used for preview selection state — not the eventual storage id. */
	previewId: string;
	name: string;
	method: string;
	deprecated: boolean;
	url: string;
	queryParams: KeyValuePair[];
	headers: KeyValuePair[];
	bodyType: ApiBodyType;
	body: string;
	formData: KeyValuePair[];
	auth: AuthConfig;
}

export interface DirectImportedFolder {
	name: string;
	requests: DirectImportedRequest[];
}

export type DirectImportSourceKind = "postman" | "curl";

export interface DirectApiDefinition {
	title: string;
	folders: DirectImportedFolder[];
	suggestedVariables: ImportedVariableSuggestion[];
	skipped: SkippedEndpoint[];
	sourceKind: DirectImportSourceKind;
}
