import type { AuthConfig, HttpMethod, KeyValuePair } from "@/lib/tools/shared/http";

export type { AuthConfig, HttpMethod, KeyValuePair };

export type ApiBodyType = "none" | "json" | "raw" | "form-urlencoded" | "form-data";

/** Rich request shape the builder UI edits. */
export interface ApiRequestConfig {
	method: HttpMethod;
	url: string;
	queryParams: KeyValuePair[];
	headers: KeyValuePair[];
	bodyType: ApiBodyType;
	body: string;
	formData: KeyValuePair[];
	auth: AuthConfig;
}

/** One multipart field as sent to the Express proxy — file content travels base64-encoded. */
export type WireFormField =
	| { key: string; isFile: false; value: string }
	| { key: string; isFile: true; fileName: string; mimeType: string; fileData: string };

/** Flattened shape actually sent over the wire to the Express proxy. */
export interface WireApiRequest {
	method: HttpMethod;
	url: string;
	queryParams: KeyValuePair[];
	headers: KeyValuePair[];
	/** Populated for every body type except "form-data", which uses `formData` instead. */
	body: string | null;
	formData?: WireFormField[];
	auth: AuthConfig;
}

export interface ApiResponse {
	success: boolean;
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: string;
	contentType: string;
	size: number;
	duration: number;
	error?: string;
}

export interface ApiExample {
	name: string;
	request: ApiRequestConfig;
}
