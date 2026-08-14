"use client";

import { useCallback, useEffect, useState } from "react";

import { getCollections } from "./storage/collections";
import { getEnvironments } from "./storage/environments";
import { getFolders } from "./storage/folders";
import { getRequests } from "./storage/requests";
import { getGlobalVariables } from "./storage/variables";
import { getWorkspaceMeta, setActiveEnvironment } from "./storage/workspace";
import type { Collection, Environment, Folder, SavedApiRequest, Variable } from "./workspace/types";

export interface WorkspaceState {
	collections: Collection[];
	folders: Folder[];
	requests: SavedApiRequest[];
	environments: Environment[];
	globalVariables: Variable[];
	activeEnvironmentId: string | null;
	isLoading: boolean;
}

/**
 * The single place that loads workspace data from IndexedDB into React state. Components perform
 * mutations by calling the storage/*.ts functions directly, then call reload() to refresh —
 * IndexedDB access itself never happens inline in a component body.
 */
export function useWorkspace() {
	const [state, setState] = useState<WorkspaceState>({
		collections: [],
		folders: [],
		requests: [],
		environments: [],
		globalVariables: [],
		activeEnvironmentId: null,
		isLoading: true,
	});

	const reload = useCallback(async () => {
		const [collections, folders, requests, environments, globalVariables, meta] = await Promise.all([
			getCollections(),
			getFolders(),
			getRequests(),
			getEnvironments(),
			getGlobalVariables(),
			getWorkspaceMeta(),
		]);

		setState({
			collections,
			folders,
			requests,
			environments,
			globalVariables,
			activeEnvironmentId: meta.activeEnvironmentId,
			isLoading: false,
		});
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	const changeActiveEnvironment = useCallback(async (id: string | null) => {
		await setActiveEnvironment(id);
		setState(prev => ({ ...prev, activeEnvironmentId: id }));
	}, []);

	return { ...state, reload, changeActiveEnvironment };
}

export type UseWorkspaceResult = ReturnType<typeof useWorkspace>;
