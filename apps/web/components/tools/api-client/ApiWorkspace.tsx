"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import type { ApiRequestConfig } from "@/lib/api-client/types";
import { defaultApiRequest } from "@/lib/api-client/utils";
import { useWorkspace } from "@/lib/api-client/useWorkspace";
import { applyExtractionRules } from "@/lib/api-client/variables/applyExtraction";
import { buildVariableMap } from "@/lib/api-client/variables/resolver";
import { createCollection, deleteCollection, duplicateCollection, updateCollection } from "@/lib/api-client/storage/collections";
import { createFolder, deleteFolder, updateFolder } from "@/lib/api-client/storage/folders";
import { deleteRequest, duplicateRequest, getRequest, saveRequest } from "@/lib/api-client/storage/requests";
import { updateEnvironment } from "@/lib/api-client/storage/environments";
import { createVariable, nameSuggestsSecret, setGlobalVariables } from "@/lib/api-client/storage/variables";
import { commitOpenApiImport } from "@/lib/api-client/storage/workspace";
import type { ResolvedVariable } from "@/lib/api-client/variables/types";
import type { SavedApiRequest, VariableExtractionRule } from "@/lib/api-client/workspace/types";

import { ApiClient } from "./ApiClient";
import { ImportApiDialog, type ImportedWorkspaceData } from "./import/ImportApiDialog";
import { ApiDashboard } from "./workspace/ApiDashboard";
import { CollectionVariablesDialog } from "./workspace/CollectionVariablesDialog";
import { EnvironmentManagerDialog } from "./workspace/EnvironmentManagerDialog";
import { EnvironmentSelector } from "./workspace/EnvironmentSelector";
import { ExtractVariableModal, type ExtractionRow } from "./workspace/ExtractVariableModal";
import { GlobalVariablesDialog } from "./workspace/GlobalVariablesDialog";
import { ImportExportDialog } from "./workspace/ImportExportDialog";
import { NameDialog } from "./workspace/NameDialog";
import { SaveRequestDialog } from "./workspace/SaveRequestDialog";
import { Sidebar } from "./workspace/Sidebar";
import type { SidebarActions } from "./workspace/SidebarActions";
import { UnsavedChangesDialog } from "./workspace/UnsavedChangesDialog";

type NamedTarget = { id: string; name: string };

function toDraft(request: SavedApiRequest): ApiRequestConfig {
	return {
		method: request.method,
		url: request.url,
		queryParams: request.queryParams,
		headers: request.headers,
		bodyType: request.bodyType,
		body: request.body,
		formData: request.formData,
		auth: request.auth,
	};
}

function isDraftEqual(a: ApiRequestConfig, b: SavedApiRequest): boolean {
	return (
		a.method === b.method &&
		a.url === b.url &&
		a.bodyType === b.bodyType &&
		a.body === b.body &&
		JSON.stringify(a.queryParams) === JSON.stringify(b.queryParams) &&
		JSON.stringify(a.headers) === JSON.stringify(b.headers) &&
		JSON.stringify(a.formData) === JSON.stringify(b.formData) &&
		JSON.stringify(a.auth) === JSON.stringify(b.auth)
	);
}

export function ApiWorkspace() {
	const workspace = useWorkspace();

	const [mode, setMode] = useState<"dashboard" | "editor">("dashboard");
	const [savedSnapshot, setSavedSnapshot] = useState<SavedApiRequest | null>(null);
	const [draft, setDraft] = useState<ApiRequestConfig>(defaultApiRequest);
	// Identifies the current "editing session" — changes whenever a different request is opened or a
	// new draft is started, so ApiClient's local state (response, active tab, etc.) resets. It does NOT
	// change when a draft is saved for the first time, so the response stays visible through that save.
	const [editorKey, setEditorKey] = useState<string>(() => crypto.randomUUID());
	const [pendingSaveTarget, setPendingSaveTarget] = useState<{ collectionId: string; folderId?: string } | null>(null);
	const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);

	const [showCreateCollection, setShowCreateCollection] = useState(false);
	const [createFolderTarget, setCreateFolderTarget] = useState<{ collectionId: string; parentId?: string } | null>(null);
	const [renameCollectionTarget, setRenameCollectionTarget] = useState<NamedTarget | null>(null);
	const [renameFolderTarget, setRenameFolderTarget] = useState<NamedTarget | null>(null);
	const [renameRequestTarget, setRenameRequestTarget] = useState<NamedTarget | null>(null);
	const [deleteCollectionTarget, setDeleteCollectionTarget] = useState<NamedTarget | null>(null);
	const [deleteFolderTarget, setDeleteFolderTarget] = useState<NamedTarget | null>(null);
	const [deleteRequestTarget, setDeleteRequestTarget] = useState<NamedTarget | null>(null);
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [showGlobalVariables, setShowGlobalVariables] = useState(false);
	const [showEnvironmentManager, setShowEnvironmentManager] = useState(false);
	const [collectionVariablesTargetId, setCollectionVariablesTargetId] = useState<string | null>(null);
	const [showImportExport, setShowImportExport] = useState(false);
	const [showImportApi, setShowImportApi] = useState(false);
	const [extractModal, setExtractModal] = useState<{ responseBody: string; initialRows?: ExtractionRow[] } | null>(null);
	const [pendingBearerVariable, setPendingBearerVariable] = useState(false);

	const isSavedRequest = Boolean(savedSnapshot);
	const dirty = savedSnapshot ? !isDraftEqual(draft, savedSnapshot) : false;

	const activeCollection = savedSnapshot ? workspace.collections.find(collection => collection.id === savedSnapshot.collectionId) : undefined;

	const activeEnvironment = workspace.environments.find(environment => environment.id === workspace.activeEnvironmentId);

	const variableMap = buildVariableMap({
		globalVariables: workspace.globalVariables,
		environmentVariables: activeEnvironment?.variables ?? [],
		collectionVariables: activeCollection?.variables ?? [],
	});

	function guardNavigation(action: () => void) {
		if (isSavedRequest && dirty) {
			setPendingNav(() => action);
		} else {
			action();
		}
	}

	async function openRequestById(id: string) {
		const request = await getRequest(id);
		if (!request) return;
		setSavedSnapshot(request);
		setDraft(toDraft(request));
		setEditorKey(crypto.randomUUID());
		setMode("editor");
	}

	function startNewRequest() {
		setSavedSnapshot(null);
		setDraft(defaultApiRequest());
		setPendingSaveTarget(null);
		setEditorKey(crypto.randomUUID());
		setMode("editor");
	}

	async function persistExtraction(rules: VariableExtractionRule[], responseBody: string): Promise<string[]> {
		const result = applyExtractionRules(rules, responseBody, {
			globalVariables: workspace.globalVariables,
			environments: workspace.environments,
			collectionVariables: activeCollection?.variables,
		});

		await setGlobalVariables(result.globalVariables);
		for (const update of result.environmentUpdates) {
			await updateEnvironment(update.environmentId, { variables: update.variables });
		}
		if (result.collectionVariables && activeCollection) {
			await updateCollection(activeCollection.id, { variables: result.collectionVariables });
		}

		await workspace.reload();
		return result.updatedVariableNames;
	}

	async function handleExtractionSave(rows: ExtractionRow[], saveForAutoExtract: boolean) {
		if (!extractModal) return;

		const rules: VariableExtractionRule[] = rows.map(row => ({
			id: row.id,
			responsePath: row.responsePath,
			variableName: row.variableName,
			scope: row.scope,
			environmentId: row.environmentId,
			secret: row.secret,
		}));

		await persistExtraction(rules, extractModal.responseBody);

		if (saveForAutoExtract && savedSnapshot) {
			const updated: SavedApiRequest = { ...savedSnapshot, extractionRules: rules, autoExtract: true, updatedAt: new Date().toISOString() };
			await saveRequest(updated);
			setSavedSnapshot(updated);
			await workspace.reload();
		}

		if (pendingBearerVariable && rows[0]) {
			setDraft(prev => ({ ...prev, auth: { type: "bearer", token: `{{${rows[0]!.variableName}}}` } }));
		}

		setExtractModal(null);
		setPendingBearerVariable(false);
	}

	function handleUseAsBearerToken(path: string, responseBody: string) {
		setPendingBearerVariable(true);
		setExtractModal({
			responseBody,
			initialRows: [
				{
					id: crypto.randomUUID(),
					responsePath: path,
					variableName: "ACCESS_TOKEN",
					scope: activeEnvironment ? "environment" : "global",
					environmentId: activeEnvironment?.id,
					secret: true,
				},
			],
		});
	}

	async function handleSave() {
		if (isSavedRequest && savedSnapshot) {
			const updated: SavedApiRequest = { ...savedSnapshot, ...draft, updatedAt: new Date().toISOString() };
			await saveRequest(updated);
			setSavedSnapshot(updated);
			await workspace.reload();
		} else {
			setShowSaveDialog(true);
		}
	}

	async function handleConfirmSave(input: { name: string; collectionId: string; folderId?: string }) {
		const now = new Date().toISOString();
		const request: SavedApiRequest = {
			id: crypto.randomUUID(),
			name: input.name,
			...draft,
			collectionId: input.collectionId,
			folderId: input.folderId,
			extractionRules: [],
			autoExtract: false,
			createdAt: now,
			updatedAt: now,
		};
		await saveRequest(request);
		setSavedSnapshot(request);
		setShowSaveDialog(false);
		setPendingSaveTarget(null);
		await workspace.reload();
	}

	async function handleDuplicateRequest(id: string) {
		const copy = await duplicateRequest(id);
		await workspace.reload();
		if (copy) await openRequestById(copy.id);
	}

	async function handleDeleteRequestConfirmed() {
		if (!deleteRequestTarget) return;
		await deleteRequest(deleteRequestTarget.id);
		if (savedSnapshot?.id === deleteRequestTarget.id) {
			setSavedSnapshot(null);
			setMode("dashboard");
		}
		setDeleteRequestTarget(null);
		await workspace.reload();
	}

	async function handleDeleteCollectionConfirmed() {
		if (!deleteCollectionTarget) return;
		await deleteCollection(deleteCollectionTarget.id);
		if (savedSnapshot?.collectionId === deleteCollectionTarget.id) {
			setSavedSnapshot(null);
			setMode("dashboard");
		}
		setDeleteCollectionTarget(null);
		await workspace.reload();
	}

	function openCollection(collectionId: string) {
		const firstRequest = [...workspace.requests]
			.filter(request => request.collectionId === collectionId)
			.sort((a, b) => a.name.localeCompare(b.name))[0];
		if (firstRequest) guardNavigation(() => openRequestById(firstRequest.id));
	}

	async function handleUpdateVariable(variable: ResolvedVariable, newValue: string) {
		if (variable.scope === "global") {
			await setGlobalVariables(workspace.globalVariables.map(item => (item.key === variable.key ? { ...item, value: newValue } : item)));
		} else if (variable.scope === "environment" && activeEnvironment) {
			await updateEnvironment(activeEnvironment.id, {
				variables: activeEnvironment.variables.map(item => (item.key === variable.key ? { ...item, value: newValue } : item)),
			});
		} else if (variable.scope === "collection" && activeCollection) {
			await updateCollection(activeCollection.id, {
				variables: activeCollection.variables.map(item => (item.key === variable.key ? { ...item, value: newValue } : item)),
			});
		}
		await workspace.reload();
	}

	async function handleCreateGlobalVariable(name: string) {
		if (workspace.globalVariables.some(item => item.key === name)) return;
		await setGlobalVariables([...workspace.globalVariables, createVariable(name, "", nameSuggestsSecret(name))]);
		await workspace.reload();
	}

	async function handleImportApi(data: ImportedWorkspaceData) {
		await commitOpenApiImport({
			collection: data.collection,
			folders: data.folders,
			requests: data.requests,
			environmentName: data.environmentName,
			environmentVariables: data.environmentVariables,
		});
		await workspace.reload();
	}

	async function handleDeleteFolderConfirmed() {
		if (!deleteFolderTarget) return;
		await deleteFolder(deleteFolderTarget.id);
		if (savedSnapshot?.folderId === deleteFolderTarget.id) {
			setSavedSnapshot(null);
			setMode("dashboard");
		}
		setDeleteFolderTarget(null);
		await workspace.reload();
	}

	const sidebarActions: SidebarActions = {
		onOpenRequest: id => guardNavigation(() => openRequestById(id)),
		onNewRequest: (collectionId, folderId) =>
			guardNavigation(() => {
				startNewRequest();
				setPendingSaveTarget({ collectionId, folderId });
			}),
		onNewFolder: (collectionId, parentId) => setCreateFolderTarget({ collectionId, parentId }),
		onRenameCollection: (id, currentName) => setRenameCollectionTarget({ id, name: currentName }),
		onDuplicateCollection: async id => {
			await duplicateCollection(id);
			await workspace.reload();
		},
		onDeleteCollection: (id, name) => setDeleteCollectionTarget({ id, name }),
		onCollectionVariables: id => setCollectionVariablesTargetId(id),
		onRenameFolder: (id, currentName) => setRenameFolderTarget({ id, name: currentName }),
		onDeleteFolder: (id, name) => setDeleteFolderTarget({ id, name }),
		onRenameRequest: (id, currentName) => setRenameRequestTarget({ id, name: currentName }),
		onDuplicateRequest: handleDuplicateRequest,
		onDeleteRequest: (id, name) => setDeleteRequestTarget({ id, name }),
	};

	return (
		<div className="flex h-[calc(100vh-4rem)] min-h-[600px] overflow-hidden rounded-xl border border-border">
			<Sidebar
				collections={workspace.collections}
				folders={workspace.folders}
				requests={workspace.requests}
				environments={workspace.environments}
				openRequestId={savedSnapshot?.id ?? null}
				actions={sidebarActions}
				onNewCollection={() => setShowCreateCollection(true)}
				onManageEnvironments={() => setShowEnvironmentManager(true)}
				onManageGlobalVariables={() => setShowGlobalVariables(true)}
			/>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
					<EnvironmentSelector
						environments={workspace.environments}
						activeEnvironmentId={workspace.activeEnvironmentId}
						onChange={workspace.changeActiveEnvironment}
					/>
					<div className="flex items-center gap-2">
						<Button onClick={() => setShowImportApi(true)} variant="ghost" size="sm">
							<Upload className="size-3.5" />
							Import API
						</Button>
						<Button onClick={() => setShowImportExport(true)} variant="ghost" size="sm">
							<Upload className="size-3.5" />
							Import / Export
						</Button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto">
					{mode === "dashboard" ? (
						<ApiDashboard
							collections={workspace.collections}
							requests={workspace.requests}
							environments={workspace.environments}
							onOpenRequest={id => guardNavigation(() => openRequestById(id))}
							onOpenCollection={openCollection}
							onNewRequest={() => guardNavigation(startNewRequest)}
							onNewCollection={() => setShowCreateCollection(true)}
							onNewEnvironment={() => setShowEnvironmentManager(true)}
							onImportApi={() => setShowImportApi(true)}
						/>
					) : (
						<div className="p-4">
							<ApiClient
								key={editorKey}
								request={draft}
								onRequestChange={setDraft}
								variableMap={variableMap}
								requestLabel={savedSnapshot?.name ?? "Untitled Request"}
								isSavedRequest={isSavedRequest}
								isDirty={dirty}
								onSave={handleSave}
								onDuplicate={savedSnapshot ? () => handleDuplicateRequest(savedSnapshot.id) : undefined}
								onRename={savedSnapshot ? () => setRenameRequestTarget({ id: savedSnapshot.id, name: savedSnapshot.name }) : undefined}
								onDelete={savedSnapshot ? () => setDeleteRequestTarget({ id: savedSnapshot.id, name: savedSnapshot.name }) : undefined}
								onExtractVariable={responseBody => setExtractModal({ responseBody })}
								onUseAsBearerToken={handleUseAsBearerToken}
								savedExtractionRules={savedSnapshot?.extractionRules}
								autoExtract={savedSnapshot?.autoExtract}
								onRunAutoExtraction={persistExtraction}
								onUpdateVariable={handleUpdateVariable}
								onCreateGlobalVariable={handleCreateGlobalVariable}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Collection / folder / request creation & rename dialogs */}
			<NameDialog
				open={showCreateCollection}
				title="Create Collection"
				nameLabel="Name"
				showDescription
				confirmLabel="Create Collection"
				onCancel={() => setShowCreateCollection(false)}
				onConfirm={async (name, description) => {
					await createCollection({ name, description });
					setShowCreateCollection(false);
					await workspace.reload();
				}}
			/>

			<NameDialog
				open={Boolean(createFolderTarget)}
				title="New Folder"
				nameLabel="Folder name"
				confirmLabel="Create Folder"
				onCancel={() => setCreateFolderTarget(null)}
				onConfirm={async name => {
					if (createFolderTarget) await createFolder({ name, ...createFolderTarget });
					setCreateFolderTarget(null);
					await workspace.reload();
				}}
			/>

			<NameDialog
				open={Boolean(renameCollectionTarget)}
				title="Rename Collection"
				nameLabel="Name"
				initialName={renameCollectionTarget?.name ?? ""}
				confirmLabel="Rename"
				onCancel={() => setRenameCollectionTarget(null)}
				onConfirm={async name => {
					if (renameCollectionTarget) await updateCollection(renameCollectionTarget.id, { name });
					setRenameCollectionTarget(null);
					await workspace.reload();
				}}
			/>

			<NameDialog
				open={Boolean(renameFolderTarget)}
				title="Rename Folder"
				nameLabel="Name"
				initialName={renameFolderTarget?.name ?? ""}
				confirmLabel="Rename"
				onCancel={() => setRenameFolderTarget(null)}
				onConfirm={async name => {
					if (renameFolderTarget) await updateFolder(renameFolderTarget.id, { name });
					setRenameFolderTarget(null);
					await workspace.reload();
				}}
			/>

			<NameDialog
				open={Boolean(renameRequestTarget)}
				title="Rename Request"
				nameLabel="Name"
				initialName={renameRequestTarget?.name ?? ""}
				confirmLabel="Rename"
				onCancel={() => setRenameRequestTarget(null)}
				onConfirm={async name => {
					if (renameRequestTarget) {
						const existing = await getRequest(renameRequestTarget.id);
						if (existing) {
							const updated = { ...existing, name, updatedAt: new Date().toISOString() };
							await saveRequest(updated);
							if (savedSnapshot?.id === updated.id) setSavedSnapshot(updated);
						}
					}
					setRenameRequestTarget(null);
					await workspace.reload();
				}}
			/>

			<SaveRequestDialog
				open={showSaveDialog}
				collections={workspace.collections}
				folders={workspace.folders}
				initialCollectionId={pendingSaveTarget?.collectionId}
				initialFolderId={pendingSaveTarget?.folderId}
				onCancel={() => setShowSaveDialog(false)}
				onConfirm={handleConfirmSave}
			/>

			{/* Delete confirmations */}
			<ConfirmDialog
				open={Boolean(deleteCollectionTarget)}
				title={`Delete "${deleteCollectionTarget?.name}"?`}
				description="This will delete all requests and folders inside this collection."
				onCancel={() => setDeleteCollectionTarget(null)}
				onConfirm={handleDeleteCollectionConfirmed}
			/>
			<ConfirmDialog
				open={Boolean(deleteFolderTarget)}
				title={`Delete "${deleteFolderTarget?.name}"?`}
				description="This will delete every request and sub-folder inside this folder."
				onCancel={() => setDeleteFolderTarget(null)}
				onConfirm={handleDeleteFolderConfirmed}
			/>
			<ConfirmDialog
				open={Boolean(deleteRequestTarget)}
				title={`Delete "${deleteRequestTarget?.name}"?`}
				description="This request will be permanently deleted."
				onCancel={() => setDeleteRequestTarget(null)}
				onConfirm={handleDeleteRequestConfirmed}
			/>

			{/* Unsaved changes guard */}
			<UnsavedChangesDialog
				open={Boolean(pendingNav)}
				onCancel={() => setPendingNav(null)}
				onDiscard={() => {
					pendingNav?.();
					setPendingNav(null);
				}}
				onSave={async () => {
					await handleSave();
					pendingNav?.();
					setPendingNav(null);
				}}
			/>

			{/* Variables & environments */}
			<GlobalVariablesDialog open={showGlobalVariables} variables={workspace.globalVariables} onClose={() => setShowGlobalVariables(false)} />

			<EnvironmentManagerDialog
				open={showEnvironmentManager}
				environments={workspace.environments}
				onClose={() => setShowEnvironmentManager(false)}
				onReload={workspace.reload}
			/>

			<CollectionVariablesDialog
				open={Boolean(collectionVariablesTargetId)}
				collection={workspace.collections.find(collection => collection.id === collectionVariablesTargetId) ?? null}
				onClose={() => setCollectionVariablesTargetId(null)}
			/>

			<ExtractVariableModal
				open={Boolean(extractModal)}
				responseBody={extractModal?.responseBody ?? ""}
				initialRows={extractModal?.initialRows}
				environments={workspace.environments}
				activeEnvironmentId={workspace.activeEnvironmentId}
				offerAutoExtract={isSavedRequest}
				onCancel={() => {
					setExtractModal(null);
					setPendingBearerVariable(false);
				}}
				onSave={handleExtractionSave}
			/>

			<ImportExportDialog open={showImportExport} onClose={() => setShowImportExport(false)} onImported={() => workspace.reload()} />

			<ImportApiDialog
				open={showImportApi}
				onClose={() => setShowImportApi(false)}
				existingCollectionNames={workspace.collections.map(collection => collection.name)}
				existingEnvironmentNames={workspace.environments.map(environment => environment.name)}
				onImport={handleImportApi}
				onOpenCollection={openCollection}
			/>
		</div>
	);
}
