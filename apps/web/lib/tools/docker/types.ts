export interface DockerPort {
	id: string;
	host: string;
	container: string;
}

export interface DockerVolume {
	id: string;
	source: string;
	target: string;
}

/** Structurally identical to the shared `KeyValuePair` — reused directly by `KeyValueEditor` in the UI. */
export interface DockerEnvVar {
	id: string;
	key: string;
	value: string;
	enabled: boolean;
}

export type DockerServicePreset = "node" | "postgres" | "mysql" | "redis" | "mongodb" | "nginx" | "custom";

export type DockerRestartPolicy = "no" | "always" | "on-failure" | "unless-stopped";

export interface DockerService {
	id: string;
	name: string;
	preset: DockerServicePreset;
	image: string;
	tag: string;
	containerName: string;
	ports: DockerPort[];
	environment: DockerEnvVar[];
	volumes: DockerVolume[];
	networks: string[];
	restart: DockerRestartPolicy;
	dependsOn: string[];
}

export interface DockerComposeConfig {
	services: DockerService[];
}

export const RESTART_POLICIES: DockerRestartPolicy[] = ["no", "always", "on-failure", "unless-stopped"];
