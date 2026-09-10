import type { DockerEnvVar, DockerPort, DockerService, DockerServicePreset, DockerVolume } from "./types";

interface PresetDefaults {
	label: string;
	image: string;
	tag: string;
	ports: Array<[string, string]>;
	environment: Array<[string, string]>;
	volumes: Array<[string, string]>;
}

/** `change-me` placeholders, never real credentials — the UI and page content both call out replacing these via env vars/secrets management. */
export const PRESET_DEFAULTS: Record<DockerServicePreset, PresetDefaults> = {
	node: {
		label: "Node.js",
		image: "node",
		tag: "20-alpine",
		ports: [["3000", "3000"]],
		environment: [["NODE_ENV", "production"]],
		volumes: [],
	},
	postgres: {
		label: "PostgreSQL",
		image: "postgres",
		tag: "17",
		ports: [["5432", "5432"]],
		environment: [
			["POSTGRES_DB", "app"],
			["POSTGRES_USER", "postgres"],
			["POSTGRES_PASSWORD", "change-me"],
		],
		volumes: [["postgres_data", "/var/lib/postgresql/data"]],
	},
	mysql: {
		label: "MySQL",
		image: "mysql",
		tag: "8",
		ports: [["3306", "3306"]],
		environment: [
			["MYSQL_DATABASE", "app"],
			["MYSQL_USER", "app"],
			["MYSQL_PASSWORD", "change-me"],
			["MYSQL_ROOT_PASSWORD", "change-me"],
		],
		volumes: [["mysql_data", "/var/lib/mysql"]],
	},
	redis: {
		label: "Redis",
		image: "redis",
		tag: "7-alpine",
		ports: [["6379", "6379"]],
		environment: [],
		volumes: [["redis_data", "/data"]],
	},
	mongodb: {
		label: "MongoDB",
		image: "mongo",
		tag: "7",
		ports: [["27017", "27017"]],
		environment: [
			["MONGO_INITDB_ROOT_USERNAME", "root"],
			["MONGO_INITDB_ROOT_PASSWORD", "change-me"],
		],
		volumes: [["mongo_data", "/data/db"]],
	},
	nginx: {
		label: "Nginx",
		image: "nginx",
		tag: "alpine",
		ports: [["80", "80"]],
		environment: [],
		volumes: [["./nginx.conf", "/etc/nginx/nginx.conf"]],
	},
	custom: {
		label: "Custom",
		image: "",
		tag: "latest",
		ports: [],
		environment: [],
		volumes: [],
	},
};

export const SERVICE_PRESET_OPTIONS: { value: DockerServicePreset; label: string }[] = (
	Object.keys(PRESET_DEFAULTS) as DockerServicePreset[]
).map(preset => ({ value: preset, label: PRESET_DEFAULTS[preset].label }));

function createId(): string {
	return crypto.randomUUID();
}

function toPorts(pairs: Array<[string, string]>): DockerPort[] {
	return pairs.map(([host, container]) => ({ id: createId(), host, container }));
}

function toEnvironment(pairs: Array<[string, string]>): DockerEnvVar[] {
	return pairs.map(([key, value]) => ({ id: createId(), key, value, enabled: true }));
}

function toVolumes(pairs: Array<[string, string]>): DockerVolume[] {
	return pairs.map(([source, target]) => ({ id: createId(), source, target }));
}

export function createServiceFromPreset(preset: DockerServicePreset): DockerService {
	const defaults = PRESET_DEFAULTS[preset];
	const name = preset === "custom" ? "service" : preset;

	return {
		id: createId(),
		name,
		preset,
		image: defaults.image,
		tag: defaults.tag,
		containerName: "",
		ports: toPorts(defaults.ports),
		environment: toEnvironment(defaults.environment),
		volumes: toVolumes(defaults.volumes),
		networks: [],
		restart: preset === "custom" ? "no" : "unless-stopped",
		dependsOn: [],
	};
}
