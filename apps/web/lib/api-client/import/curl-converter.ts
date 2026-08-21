import { parseCurl } from "@/lib/tools/curl/parser";
import type { CurlRequest } from "@/lib/tools/curl/types";

import type { ApiBodyType } from "../types";
import type { DirectApiDefinition, DirectImportedRequest, SkippedEndpoint } from "./types";

const BODY_TYPE_MAP: Record<CurlRequest["bodyType"], ApiBodyType> = {
	none: "none",
	json: "json",
	raw: "raw",
	"form-urlencoded": "form-urlencoded",
	multipart: "form-data",
};

/** Splits a batch of pasted commands into individual cURL commands, one per blank-line-separated block. */
export function splitCurlCommands(text: string): string[] {
	return text
		.split(/\n\s*\n+/)
		.map(block => block.trim())
		.filter(Boolean);
}

function deriveRequestName(curlRequest: CurlRequest): string {
	try {
		const url = new URL(curlRequest.url);
		return `${curlRequest.method} ${url.pathname || "/"}`;
	} catch {
		return `${curlRequest.method} ${curlRequest.url || "/"}`;
	}
}

/**
 * File form fields carry an on-disk path in cURL (`-F key=@path`), not real file content — there's
 * nothing to import, so they come through as an empty text field for the user to re-attach.
 */
function sanitizeFormData(formData: CurlRequest["formData"]) {
	return formData.map(field => (field.type === "file" ? { ...field, type: "text" as const, value: "", fileName: undefined } : field));
}

export interface CurlImportResult {
	success: boolean;
	definition?: DirectApiDefinition;
	error?: string;
}

const FOLDER_NAME = "Imported Requests";

/** Parses one or more pasted cURL commands into a DirectApiDefinition ready for the import wizard. */
export function buildDefinitionFromCurlText(text: string): CurlImportResult {
	const blocks = splitCurlCommands(text);
	if (blocks.length === 0) {
		return { success: false, error: "Please paste at least one cURL command to import." };
	}

	const requests: DirectImportedRequest[] = [];
	const skipped: SkippedEndpoint[] = [];

	for (const block of blocks) {
		const parsed = parseCurl(block);
		if (!parsed.success || !parsed.data) {
			skipped.push({ method: "-", path: block.length > 60 ? `${block.slice(0, 60)}…` : block, reason: parsed.error ?? "Unable to parse this command." });
			continue;
		}

		const curlRequest = parsed.data;
		requests.push({
			previewId: crypto.randomUUID(),
			name: deriveRequestName(curlRequest),
			method: curlRequest.method,
			deprecated: false,
			url: curlRequest.url,
			queryParams: curlRequest.queryParams,
			headers: curlRequest.headers,
			bodyType: BODY_TYPE_MAP[curlRequest.bodyType],
			body: curlRequest.body,
			formData: sanitizeFormData(curlRequest.formData),
			auth: curlRequest.auth,
		});
	}

	if (requests.length === 0) {
		return { success: false, error: "None of the pasted text could be parsed as a cURL command." };
	}

	return {
		success: true,
		definition: {
			title: requests.length === 1 ? requests[0]!.name : "Imported from cURL",
			folders: [{ name: FOLDER_NAME, requests }],
			suggestedVariables: [],
			skipped,
			sourceKind: "curl",
		},
	};
}
