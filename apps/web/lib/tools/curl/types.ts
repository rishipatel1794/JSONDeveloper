export { HTTP_METHODS, type AuthConfig, type HttpMethod, type KeyValuePair } from "../shared/http";

import type { AuthConfig, HttpMethod, KeyValuePair } from "../shared/http";

export type BodyType = "none" | "json" | "raw" | "form-urlencoded" | "multipart";

export interface CurlRequest {
	method: HttpMethod;
	url: string;

	queryParams: KeyValuePair[];
	headers: KeyValuePair[];

	bodyType: BodyType;
	body: string;
	formData: KeyValuePair[];

	auth: AuthConfig;

	followRedirects: boolean;
	compressed: boolean;
	insecure: boolean;
	cookies: string;
	userAgent: string;
}

export type Shell = "bash" | "powershell";

export interface CurlExample {
	name: string;
	request: CurlRequest;
}

export interface CurlParseResult {
	success: boolean;
	data?: CurlRequest;
	error?: string;
}
