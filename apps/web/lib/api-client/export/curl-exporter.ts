import { generateCurl } from "@/lib/tools/curl/generator";
import type { BodyType, CurlRequest } from "@/lib/tools/curl/types";

import type { ApiBodyType, ApiRequestConfig } from "../types";

const BODY_TYPE_MAP: Record<ApiBodyType, BodyType> = {
	none: "none",
	json: "json",
	raw: "raw",
	"form-urlencoded": "form-urlencoded",
	"form-data": "multipart",
};

/** Builds a copy-pasteable bash cURL command for a request — used by the API Client's "Copy as cURL" action. */
export function apiRequestToCurlCommand(request: ApiRequestConfig): string {
	const curlRequest: CurlRequest = {
		method: request.method,
		url: request.url,
		queryParams: request.queryParams,
		headers: request.headers,
		bodyType: BODY_TYPE_MAP[request.bodyType],
		body: request.body,
		formData: request.formData,
		auth: request.auth,
		followRedirects: false,
		compressed: false,
		insecure: false,
		cookies: "",
		userAgent: "",
	};

	return generateCurl(curlRequest, "bash");
}
