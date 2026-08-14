import type { AuthConfig, HttpMethod, KeyValuePair } from "@/lib/tools/shared/http";

import type { ApiBodyType } from "../types";

export interface Variable {
	id: string;
	key: string;
	value: string;
	enabled: boolean;
	secret?: boolean;
}

export type VariableScope = "global" | "environment" | "collection";

export interface Environment {
	id: string;
	name: string;
	variables: Variable[];
	createdAt: string;
	updatedAt: string;
}

export interface Collection {
	id: string;
	name: string;
	description?: string;
	variables: Variable[];
	/** Collection-level default auth. Requests may override; inheritance logic is a follow-up phase. */
	auth?: AuthConfig;
	createdAt: string;
	updatedAt: string;
}

export interface Folder {
	id: string;
	name: string;
	collectionId: string;
	/** Absent for a top-level folder; set for a folder nested inside another folder. */
	parentId?: string;
	createdAt: string;
}

export interface VariableExtractionRule {
	id: string;
	responsePath: string;
	variableName: string;
	scope: VariableScope;
	/** Required when scope is "environment" — which environment to write into. */
	environmentId?: string;
	secret: boolean;
}

export interface SavedApiRequest {
	id: string;
	name: string;
	method: HttpMethod;
	url: string;
	queryParams: KeyValuePair[];
	headers: KeyValuePair[];
	bodyType: ApiBodyType;
	body: string;
	formData: KeyValuePair[];
	auth: AuthConfig;
	collectionId: string;
	folderId?: string;
	extractionRules: VariableExtractionRule[];
	autoExtract: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface WorkspaceMeta {
	key: "meta";
	schemaVersion: number;
	activeEnvironmentId: string | null;
}

export const WORKSPACE_SCHEMA_VERSION = 1;

/** Shape used for full workspace export/import. */
export interface WorkspaceExport {
	schemaVersion: number;
	exportedAt: string;
	includesSecrets: boolean;
	collections: Collection[];
	folders: Folder[];
	requests: SavedApiRequest[];
	environments: Environment[];
	globalVariables: Variable[];
	activeEnvironmentId: string | null;
}
