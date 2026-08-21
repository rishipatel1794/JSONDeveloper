"use client";

import { useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { buildDefinitionFromCurlText } from "@/lib/api-client/import/curl-converter";
import { mapDirectToWorkspaceRecords } from "@/lib/api-client/import/direct-mapper";
import { buildApiDefinition, mapToWorkspaceRecords } from "@/lib/api-client/import/openapi-converter";
import { parseOpenApiSpec } from "@/lib/api-client/import/openapi-parser";
import { buildDefinitionFromPostman } from "@/lib/api-client/import/postman-converter";
import { parsePostmanCollection } from "@/lib/api-client/import/postman-parser";
import type { DirectApiDefinition, ImportedApiDefinition, SkippedEndpoint } from "@/lib/api-client/import/types";
import type { Collection, Folder, SavedApiRequest, Variable } from "@/lib/api-client/workspace/types";

import { CurlBatchEditor } from "./CurlBatchEditor";
import { ImportSourceSelector, type ImportSourceType } from "./ImportSourceSelector";
import { OpenApiEditor } from "./OpenApiEditor";
import { OpenApiEndpointTree } from "./OpenApiEndpointTree";
import { OpenApiFileUpload } from "./OpenApiFileUpload";
import { OpenApiImportOptions } from "./OpenApiImportOptions";
import { OpenApiImportResult } from "./OpenApiImportResult";
import { OpenApiImportSummary } from "./OpenApiImportSummary";

type WizardStep = "source" | "input" | "preview" | "summary" | "result";
type InputMode = "upload" | "paste";

type WizardDefinition = { kind: "openapi"; data: ImportedApiDefinition } | { kind: "direct"; data: DirectApiDefinition };

const SOURCE_LABELS: Record<ImportSourceType, string> = {
	openapi: "OpenAPI",
	postman: "Postman Collection",
	curl: "cURL",
};

export interface ImportedWorkspaceData {
	collection: Collection;
	folders: Folder[];
	requests: SavedApiRequest[];
	environmentVariables: Variable[];
	environmentName: string;
	skippedCount: number;
	skippedDetails: SkippedEndpoint[];
}

interface ImportApiDialogProps {
	open: boolean;
	onClose: () => void;
	existingCollectionNames: string[];
	existingEnvironmentNames: string[];
	onImport: (data: ImportedWorkspaceData) => Promise<void>;
	onOpenCollection: (collectionId: string) => void;
}

function uniqueName(base: string, existing: string[]): string {
	if (!existing.includes(base)) return base;
	let counter = 2;
	while (existing.includes(`${base} ${counter}`)) counter++;
	return `${base} ${counter}`;
}

export function ImportApiDialog({ open, onClose, existingCollectionNames, existingEnvironmentNames, onImport, onOpenCollection }: ImportApiDialogProps) {
	const [step, setStep] = useState<WizardStep>("source");
	const [sourceType, setSourceType] = useState<ImportSourceType>("openapi");
	const [inputMode, setInputMode] = useState<InputMode>("paste");
	const [specText, setSpecText] = useState("");
	const [parseError, setParseError] = useState("");

	const [definition, setDefinition] = useState<WizardDefinition | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [collectionName, setCollectionName] = useState("");
	const [collectionDescription, setCollectionDescription] = useState("");
	const [environmentName, setEnvironmentName] = useState("");
	const [selectedServerIndex, setSelectedServerIndex] = useState(0);
	const [generateBodies, setGenerateBodies] = useState(true);
	const [selectedVariableNames, setSelectedVariableNames] = useState<Set<string>>(new Set());

	const [isImporting, setIsImporting] = useState(false);
	const [importError, setImportError] = useState("");
	const [committedCollectionId, setCommittedCollectionId] = useState<string | null>(null);
	const [resultStats, setResultStats] = useState<{ requestCount: number; folderCount: number; variableCount: number } | null>(null);

	function resetAndClose() {
		setStep("source");
		setSpecText("");
		setParseError("");
		setDefinition(null);
		setSelectedIds(new Set());
		setImportError("");
		setCommittedCollectionId(null);
		setResultStats(null);
		onClose();
	}

	function loadPreview(title: string, folderPreviewIds: string[], suggestedVariableNames: string[]) {
		setCollectionName(uniqueName(title, existingCollectionNames));
		setCollectionDescription("");
		setEnvironmentName(uniqueName(`Imported — ${title}`, existingEnvironmentNames));
		setSelectedIds(new Set(folderPreviewIds));
		setSelectedVariableNames(new Set(suggestedVariableNames));
		setSelectedServerIndex(0);
		setParseError("");
		setStep("preview");
	}

	function handleParse() {
		if (sourceType === "openapi") {
			const parsed = parseOpenApiSpec(specText);
			if (!parsed.success || !parsed.document || !parsed.version || !parsed.format) {
				setParseError(parsed.error ?? "Unable to import API specification.");
				return;
			}

			const def = buildApiDefinition(parsed.document, parsed.version, parsed.format);
			setDefinition({ kind: "openapi", data: def });
			setCollectionDescription(def.description ?? "");
			loadPreview(
				def.title,
				def.folders.flatMap(folder => folder.requests.map(request => request.previewId)),
				def.suggestedVariables.map(variable => variable.name),
			);
			return;
		}

		if (sourceType === "postman") {
			const parsed = parsePostmanCollection(specText);
			if (!parsed.success || !parsed.collection) {
				setParseError(parsed.error ?? "Unable to import this Postman collection.");
				return;
			}

			const def = buildDefinitionFromPostman(parsed.collection);
			setDefinition({ kind: "direct", data: def });
			loadPreview(
				def.title,
				def.folders.flatMap(folder => folder.requests.map(request => request.previewId)),
				def.suggestedVariables.map(variable => variable.name),
			);
			return;
		}

		const result = buildDefinitionFromCurlText(specText);
		if (!result.success || !result.definition) {
			setParseError(result.error ?? "Unable to parse these cURL commands.");
			return;
		}

		setDefinition({ kind: "direct", data: result.definition });
		loadPreview(
			result.definition.title,
			result.definition.folders.flatMap(folder => folder.requests.map(request => request.previewId)),
			result.definition.suggestedVariables.map(variable => variable.name),
		);
	}

	async function handleConfirmImport() {
		if (!definition) return;

		setIsImporting(true);
		setImportError("");

		try {
			const result =
				definition.kind === "openapi"
					? mapToWorkspaceRecords(
							definition.data,
							selectedIds,
							{ generateBodies, selectedServerIndex, selectedVariableNames },
							collectionName.trim() || definition.data.title,
							collectionDescription.trim() || undefined,
						)
					: mapDirectToWorkspaceRecords(
							definition.data,
							selectedIds,
							{ selectedVariableNames },
							collectionName.trim() || definition.data.title,
							collectionDescription.trim() || undefined,
						);

			await onImport({
				collection: result.collection,
				folders: result.folders,
				requests: result.requests,
				environmentVariables: result.environmentVariables,
				environmentName: environmentName.trim() || `Imported — ${definition.data.title}`,
				skippedCount: result.skippedCount,
				skippedDetails: definition.data.skipped,
			});

			setCommittedCollectionId(result.collection.id);
			setResultStats({
				requestCount: result.requests.length,
				folderCount: result.folders.length,
				variableCount: result.environmentVariables.length,
			});
			setStep("result");
		} catch {
			setImportError("Unable to save the imported workspace. Please try again.");
		} finally {
			setIsImporting(false);
		}
	}

	const selectedCount = selectedIds.size;
	const dialogTitle =
		step === "source"
			? "Import API"
			: step === "input"
				? `Import ${SOURCE_LABELS[sourceType]}`
				: step === "preview"
					? "Import Preview"
					: step === "summary"
						? "Import Summary"
						: "Import Result";

	return (
		<Dialog open={open} onClose={resetAndClose} title={dialogTitle} className="max-w-2xl">
			{step === "source" && (
				<div className="space-y-4">
					<ImportSourceSelector value={sourceType} onChange={setSourceType} />
					<div className="flex justify-end gap-2">
						<Button onClick={resetAndClose} variant="ghost">
							Cancel
						</Button>
						<Button onClick={() => setStep("input")}>Next</Button>
					</div>
				</div>
			)}

			{step === "input" && sourceType !== "curl" && (
				<div className="space-y-4">
					<div className="inline-flex rounded-md border border-border bg-card p-1">
						{(["paste", "upload"] as const).map(mode => (
							<button
								key={mode}
								type="button"
								onClick={() => setInputMode(mode)}
								className={
									"rounded px-3 py-1.5 text-sm font-medium transition-colors " +
									(inputMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
								}
							>
								{mode === "paste" ? "Paste Specification" : "Upload File"}
							</button>
						))}
					</div>

					{inputMode === "paste" ? (
						<OpenApiEditor value={specText} onChange={setSpecText} />
					) : sourceType === "postman" ? (
						<OpenApiFileUpload
							onFileLoaded={text => setSpecText(text)}
							acceptedExtensions={[".json"]}
							tooLargeMessage={"This collection is too large to import.\n\nMaximum supported size is 10 MB."}
						/>
					) : (
						<OpenApiFileUpload onFileLoaded={text => setSpecText(text)} />
					)}

					<p className="text-xs text-subtle-foreground">
						{sourceType === "postman" ? "Supported: Postman Collection v2.0 and v2.1." : "Supported: OpenAPI 3.x and Swagger 2.0."} Parsed entirely in
						your browser.
					</p>

					{parseError && <ToolAlert variant="error">{parseError}</ToolAlert>}

					<div className="flex justify-end gap-2">
						<Button onClick={() => setStep("source")} variant="ghost">
							Back
						</Button>
						<Button onClick={handleParse} disabled={!specText.trim()}>
							Parse
						</Button>
					</div>
				</div>
			)}

			{step === "input" && sourceType === "curl" && (
				<div className="space-y-4">
					<CurlBatchEditor value={specText} onChange={setSpecText} />
					<p className="text-xs text-subtle-foreground">Paste one or more cURL commands, separated by a blank line. Parsed entirely in your browser.</p>

					{parseError && <ToolAlert variant="error">{parseError}</ToolAlert>}

					<div className="flex justify-end gap-2">
						<Button onClick={() => setStep("source")} variant="ghost">
							Back
						</Button>
						<Button onClick={handleParse} disabled={!specText.trim()}>
							Parse
						</Button>
					</div>
				</div>
			)}

			{step === "preview" && definition && (
				<div className="space-y-4">
					<div>
						<label className="block">
							<span className="mb-1 block text-xs font-medium text-muted-foreground">Collection Name</span>
							<input
								type="text"
								value={collectionName}
								onChange={event => setCollectionName(event.target.value)}
								className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</label>
						{definition.kind === "openapi" && definition.data.version && (
							<p className="mt-1 text-xs text-subtle-foreground">Version {definition.data.version}</p>
						)}
					</div>

					<OpenApiImportOptions
						servers={definition.kind === "openapi" ? definition.data.servers : []}
						selectedServerIndex={selectedServerIndex}
						onServerChange={setSelectedServerIndex}
						generateBodies={generateBodies}
						onGenerateBodiesChange={setGenerateBodies}
						showGenerateBodies={definition.kind === "openapi"}
						suggestedVariables={definition.data.suggestedVariables}
						selectedVariableNames={selectedVariableNames}
						onVariableSelectionChange={setSelectedVariableNames}
					/>

					<div>
						<p className="mb-1.5 text-sm font-medium text-foreground">Endpoints</p>
						<OpenApiEndpointTree folders={definition.data.folders} selectedIds={selectedIds} onChange={setSelectedIds} />
					</div>

					<div className="flex justify-end gap-2">
						<Button onClick={() => setStep("input")} variant="ghost">
							Back
						</Button>
						<Button onClick={() => setStep("summary")} disabled={selectedCount === 0 || !collectionName.trim()}>
							Next
						</Button>
					</div>
				</div>
			)}

			{step === "summary" && definition && (
				<div className="space-y-4">
					<OpenApiImportSummary
						collectionName={collectionName}
						requestCount={selectedCount}
						folderCount={definition.data.folders.filter(folder => folder.requests.some(request => selectedIds.has(request.previewId))).length}
						environmentName={environmentName}
						variableNames={[...selectedVariableNames]}
					/>

					{importError && <ToolAlert variant="error">{importError}</ToolAlert>}

					<div className="flex justify-end gap-2">
						<Button onClick={() => setStep("preview")} variant="ghost">
							Back
						</Button>
						<Button onClick={handleConfirmImport} disabled={isImporting}>
							{isImporting ? "Importing…" : `Import ${selectedCount} Request${selectedCount === 1 ? "" : "s"}`}
						</Button>
					</div>
				</div>
			)}

			{step === "result" && resultStats && (
				<OpenApiImportResult
					collectionName={collectionName}
					requestCount={resultStats.requestCount}
					folderCount={resultStats.folderCount}
					variableCount={resultStats.variableCount}
					skippedCount={definition?.data.skipped.length ?? 0}
					skippedDetails={definition?.data.skipped ?? []}
					onOpenCollection={() => {
						if (committedCollectionId) onOpenCollection(committedCollectionId);
						resetAndClose();
					}}
					onClose={resetAndClose}
				/>
			)}
		</Dialog>
	);
}
