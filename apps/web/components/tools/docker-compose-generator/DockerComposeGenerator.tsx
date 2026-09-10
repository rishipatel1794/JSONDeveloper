"use client";

import { useMemo, useState } from "react";
import { Copy, Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { KeyValueEditor } from "@/components/tools/shared/KeyValueEditor";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { generateDockerCompose } from "@/lib/tools/docker/compose-generator";
import { createServiceFromPreset, SERVICE_PRESET_OPTIONS } from "@/lib/tools/docker/presets";
import { RESTART_POLICIES, type DockerRestartPolicy, type DockerService, type DockerServicePreset } from "@/lib/tools/docker/types";

import { TwoFieldListEditor } from "./TwoFieldListEditor";

const inputClasses =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const selectClasses =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<label className="block text-xs font-medium text-muted-foreground">{label}</label>
			<div className="mt-1">{children}</div>
		</div>
	);
}

function cloneWithNewIds(service: DockerService): DockerService {
	return {
		...service,
		id: crypto.randomUUID(),
		name: `${service.name}-copy`,
		ports: service.ports.map(port => ({ ...port, id: crypto.randomUUID() })),
		environment: service.environment.map(env => ({ ...env, id: crypto.randomUUID() })),
		volumes: service.volumes.map(volume => ({ ...volume, id: crypto.randomUUID() })),
	};
}

export function DockerComposeGenerator() {
	const [services, setServices] = useState<DockerService[]>(() => [createServiceFromPreset("node")]);

	const output = useMemo(() => generateDockerCompose({ services }), [services]);
	const serviceNames = services.map(service => service.name.trim()).filter(Boolean);

	function updateService(id: string, patch: Partial<DockerService>) {
		setServices(previous => previous.map(service => (service.id === id ? { ...service, ...patch } : service)));
	}

	function addService(preset: DockerServicePreset) {
		setServices(previous => [...previous, createServiceFromPreset(preset)]);
	}

	function removeService(id: string) {
		setServices(previous => previous.filter(service => service.id !== id));
	}

	function duplicateService(id: string) {
		setServices(previous => {
			const index = previous.findIndex(service => service.id === id);
			if (index === -1) return previous;
			const copy = cloneWithNewIds(previous[index]!);
			return [...previous.slice(0, index + 1), copy, ...previous.slice(index + 1)];
		});
	}

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<label className="flex items-center gap-2 text-sm text-muted-foreground">
						<Sparkles className="size-4" />
						Add service
						<select
							onChange={event => {
								if (event.target.value) {
									addService(event.target.value as DockerServicePreset);
									event.target.value = "";
								}
							}}
							defaultValue=""
							className={selectClasses}
							aria-label="Add a service"
						>
							<option value="" disabled>
								Choose a service type…
							</option>
							{SERVICE_PRESET_OPTIONS.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<Button onClick={() => setServices([])} variant="ghost" size="sm" disabled={services.length === 0} className="text-destructive hover:bg-destructive-muted">
						<Trash2 className="size-3.5" />
						Remove all
					</Button>
				</div>
			</div>

			{services.length === 0 && (
				<ToolAlert variant="info">Add a service above to start building your docker-compose.yml.</ToolAlert>
			)}

			{services.map(service => (
				<ToolPanel key={service.id} title={service.name.trim() || "Untitled service"} icon={Sparkles}>
					<div className="grid gap-4 p-4 sm:grid-cols-2">
						<Field label="Service name">
							<input value={service.name} onChange={event => updateService(service.id, { name: event.target.value })} className={inputClasses} />
						</Field>
						<Field label="Container name (optional)">
							<input
								value={service.containerName}
								onChange={event => updateService(service.id, { containerName: event.target.value })}
								className={inputClasses}
							/>
						</Field>
						<Field label="Image">
							<input value={service.image} onChange={event => updateService(service.id, { image: event.target.value })} className={inputClasses} />
						</Field>
						<Field label="Tag / version">
							<input value={service.tag} onChange={event => updateService(service.id, { tag: event.target.value })} className={inputClasses} />
						</Field>
						<Field label="Restart policy">
							<select
								value={service.restart}
								onChange={event => updateService(service.id, { restart: event.target.value as DockerRestartPolicy })}
								className={selectClasses}
							>
								{RESTART_POLICIES.map(policy => (
									<option key={policy} value={policy}>
										{policy}
									</option>
								))}
							</select>
						</Field>
						<Field label="Depends on (comma-separated service names)">
							<input
								value={service.dependsOn.join(", ")}
								onChange={event =>
									updateService(service.id, { dependsOn: event.target.value.split(",").map(name => name.trim()).filter(Boolean) })
								}
								placeholder={serviceNames.filter(name => name !== service.name.trim()).join(", ") || "e.g. postgres"}
								className={inputClasses}
							/>
						</Field>

						<div className="sm:col-span-2">
							<label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ports</label>
							<TwoFieldListEditor
								items={service.ports}
								firstField="host"
								secondField="container"
								firstPlaceholder="Host port"
								secondPlaceholder="Container port"
								addLabel="Add port"
								createRow={() => ({ id: crypto.randomUUID(), host: "", container: "" })}
								onChange={ports => updateService(service.id, { ports })}
							/>
						</div>

						<div className="sm:col-span-2">
							<label className="mb-1.5 block text-xs font-medium text-muted-foreground">Environment variables</label>
							<KeyValueEditor
								items={service.environment}
								onChange={environment => updateService(service.id, { environment })}
								keyPlaceholder="KEY"
								valuePlaceholder="value"
								addLabel="Add variable"
								aria-label="Environment variables"
							/>
						</div>

						<div className="sm:col-span-2">
							<label className="mb-1.5 block text-xs font-medium text-muted-foreground">Volumes</label>
							<TwoFieldListEditor
								items={service.volumes}
								firstField="source"
								secondField="target"
								firstPlaceholder="Source (name or ./path)"
								secondPlaceholder="Container path"
								addLabel="Add volume"
								createRow={() => ({ id: crypto.randomUUID(), source: "", target: "" })}
								onChange={volumes => updateService(service.id, { volumes })}
							/>
						</div>

						<Field label="Networks (comma-separated)">
							<input
								value={service.networks.join(", ")}
								onChange={event => updateService(service.id, { networks: event.target.value.split(",").map(name => name.trim()).filter(Boolean) })}
								placeholder="app-network"
								className={inputClasses}
							/>
						</Field>

						<div className="flex items-end justify-end gap-2 sm:col-span-2">
							<Button onClick={() => duplicateService(service.id)} variant="outline" size="sm">
								<Copy className="size-3.5" />
								Duplicate
							</Button>
							<Button onClick={() => removeService(service.id)} variant="ghost" size="sm" className="text-destructive hover:bg-destructive-muted">
								<Trash2 className="size-3.5" />
								Remove service
							</Button>
						</div>
					</div>
				</ToolPanel>
			))}

			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
					<span className="text-sm font-medium">docker-compose.yml</span>
					<div className="flex items-center gap-2">
						<CopyButton value={output} ariaLabel="Copy docker-compose.yml" disabled={!output} />
						<Button onClick={() => downloadTextFile(output, "docker-compose.yml", "text/yaml")} variant="outline" size="sm" disabled={!output}>
							Download
						</Button>
					</div>
				</div>

				{output ? (
					<CodeEditor value={output} onChange={() => {}} language="yaml" readOnly height="380px" />
				) : (
					<p className="px-4 py-8 text-center text-sm text-muted-foreground">Add at least one service with a name and image to generate output.</p>
				)}
			</div>

			<ToolAlert variant="warning">
				Placeholder values like <code className="font-mono">change-me</code> are not real credentials. Replace them with environment variables or a
				secrets manager before deploying — never commit real passwords or API keys to version control.
			</ToolAlert>

			<div className="flex justify-center">
				<Button onClick={() => addService("custom")} variant="ghost" size="sm">
					<Plus className="size-3.5" />
					Add custom service
				</Button>
			</div>
		</div>
	);
}
