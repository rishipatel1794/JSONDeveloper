import { FolderClosed, Globe2, Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { Collection, Environment, SavedApiRequest } from "@/lib/api-client/workspace/types";

import { MethodBadge } from "./MethodBadge";

interface ApiDashboardProps {
	collections: Collection[];
	requests: SavedApiRequest[];
	environments: Environment[];
	onOpenRequest: (id: string) => void;
	onOpenCollection: (id: string) => void;
	onNewRequest: () => void;
	onNewCollection: () => void;
	onNewEnvironment: () => void;
	onImportApi: () => void;
}

export function ApiDashboard({
	collections,
	requests,
	environments,
	onOpenRequest,
	onOpenCollection,
	onNewRequest,
	onNewCollection,
	onNewEnvironment,
	onImportApi,
}: ApiDashboardProps) {
	const recent = [...requests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
					<p className="mt-1 text-sm text-muted-foreground">Pick up where you left off, or start something new.</p>
				</div>
				<Button onClick={onImportApi} variant="outline" size="sm" className="shrink-0">
					<Upload className="size-3.5" />
					Import API
				</Button>
			</div>

			<section>
				<h2 className="mb-3 text-sm font-semibold text-foreground">Collections</h2>

				{collections.length === 0 ? (
					<div className="rounded-lg border border-dashed border-border p-6 text-center">
						<p className="text-sm text-muted-foreground">No collections yet. Create your first API collection to organize your requests.</p>
						<div className="mt-3 flex flex-wrap justify-center gap-2">
							<Button onClick={onNewCollection} variant="outline" size="sm">
								<Plus className="size-3.5" />
								Create Collection
							</Button>
							<Button onClick={onImportApi} variant="outline" size="sm">
								<Upload className="size-3.5" />
								Import from OpenAPI
							</Button>
						</div>
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{collections.map(collection => {
							const count = requests.filter(request => request.collectionId === collection.id).length;
							return (
								<button
									key={collection.id}
									type="button"
									onClick={() => onOpenCollection(collection.id)}
									className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-elevated"
								>
									<span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
										<FolderClosed className="size-5" />
									</span>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-semibold text-foreground">{collection.name}</span>
										<span className="block text-xs text-muted-foreground">
											{count} request{count === 1 ? "" : "s"}
										</span>
									</span>
								</button>
							);
						})}
					</div>
				)}
			</section>

			<section>
				<h2 className="mb-3 text-sm font-semibold text-foreground">Environments</h2>

				{environments.length === 0 ? (
					<div className="rounded-lg border border-dashed border-border p-6 text-center">
						<p className="text-sm text-muted-foreground">
							No environment selected. Create an environment to use variables such as {"{{BASE_URL}}"} and {"{{ACCESS_TOKEN}}"}.
						</p>
						<Button onClick={onNewEnvironment} variant="outline" size="sm" className="mt-3">
							<Plus className="size-3.5" />
							Create Environment
						</Button>
					</div>
				) : (
					<div className="flex flex-wrap gap-2">
						{environments.map(environment => (
							<span key={environment.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
								<Globe2 className="size-3 text-muted-foreground" />
								{environment.name}
							</span>
						))}
					</div>
				)}
			</section>

			{recent.length > 0 && (
				<section>
					<h2 className="mb-3 text-sm font-semibold text-foreground">Recent</h2>
					<div className="divide-y divide-border-subtle rounded-lg border border-border bg-card">
						{recent.map(request => (
							<button
								key={request.id}
								type="button"
								onClick={() => onOpenRequest(request.id)}
								className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-secondary"
							>
								<MethodBadge method={request.method} />
								<span className="min-w-0 flex-1 truncate text-foreground">{request.name}</span>
							</button>
						))}
					</div>
				</section>
			)}

			<section>
				<h2 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h2>
				<div className="flex flex-wrap gap-2">
					<Button onClick={onNewRequest}>
						<Plus className="size-3.5" />
						New Request
					</Button>
					<Button onClick={onNewCollection} variant="outline">
						New Collection
					</Button>
					<Button onClick={onNewEnvironment} variant="outline">
						New Environment
					</Button>
					<Button onClick={onImportApi} variant="outline">
						<Upload className="size-3.5" />
						Import API
					</Button>
				</div>
			</section>
		</div>
	);
}
