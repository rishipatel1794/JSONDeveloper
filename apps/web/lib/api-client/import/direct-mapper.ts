import { createVariable } from "../storage/variables";
import type { Collection, Folder, SavedApiRequest, Variable } from "../workspace/types";
import type { DirectApiDefinition } from "./types";
import type { WorkspaceImportResult } from "./openapi-converter";

export interface DirectImportOptions {
	selectedVariableNames: Set<string>;
}

/**
 * Maps a "direct" definition (Postman Collection, cURL) to workspace records. Unlike
 * mapToWorkspaceRecords (OpenAPI/Swagger), it never rewrites request urls or auth — those already
 * carry concrete, ready-to-use values from the source — so this is a much thinner pass: select
 * requests, bucket them into folders, and turn suggested variables into an environment.
 */
export function mapDirectToWorkspaceRecords(
	definition: DirectApiDefinition,
	selectedIds: Set<string>,
	options: DirectImportOptions,
	collectionName: string,
	collectionDescription: string | undefined,
): WorkspaceImportResult {
	const now = new Date().toISOString();
	const collectionId = crypto.randomUUID();

	const folders: Folder[] = [];
	const requests: SavedApiRequest[] = [];
	let skippedCount = definition.skipped.length;

	for (const directFolder of definition.folders) {
		const selectedRequests = directFolder.requests.filter(request => selectedIds.has(request.previewId));
		skippedCount += directFolder.requests.length - selectedRequests.length;
		if (selectedRequests.length === 0) continue;

		const folder: Folder = {
			id: crypto.randomUUID(),
			name: directFolder.name,
			collectionId,
			createdAt: now,
		};
		folders.push(folder);

		for (const directRequest of selectedRequests) {
			const request: SavedApiRequest = {
				id: crypto.randomUUID(),
				name: directRequest.deprecated ? `${directRequest.name} (Deprecated)` : directRequest.name,
				method: directRequest.method as SavedApiRequest["method"],
				url: directRequest.url,
				queryParams: directRequest.queryParams,
				headers: directRequest.headers,
				bodyType: directRequest.bodyType,
				body: directRequest.body,
				formData: directRequest.formData,
				auth: directRequest.auth,
				collectionId,
				folderId: folder.id,
				extractionRules: [],
				autoExtract: false,
				createdAt: now,
				updatedAt: now,
			};

			requests.push(request);
		}
	}

	const collection: Collection = {
		id: collectionId,
		name: collectionName,
		description: collectionDescription,
		variables: [],
		createdAt: now,
		updatedAt: now,
	};

	const environmentVariables: Variable[] = [];
	for (const suggestion of definition.suggestedVariables) {
		if (options.selectedVariableNames.has(suggestion.name)) {
			environmentVariables.push(createVariable(suggestion.name, suggestion.suggestedDefault ?? "", suggestion.secret));
		}
	}

	return { collection, folders, requests, environmentVariables, skippedCount };
}
