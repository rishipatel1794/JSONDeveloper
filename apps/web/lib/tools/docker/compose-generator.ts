import * as yaml from "js-yaml";

import type { DockerComposeConfig, DockerService } from "./types";

const SECRET_NOTICE =
	"# Replace placeholder values (e.g. \"change-me\") with real secrets from environment variables\n" +
	"# or a secrets manager — never commit real passwords or API keys to version control.\n";

/** A bind mount (path or relative path) doesn't need a top-level `volumes:` declaration — only named volumes do. */
function isNamedVolume(source: string): boolean {
	return !source.startsWith("/") && !source.startsWith("./") && !source.startsWith("../") && !source.startsWith("$");
}

function buildServiceEntry(service: DockerService): Record<string, unknown> {
	const entry: Record<string, unknown> = {};

	entry.image = service.tag ? `${service.image}:${service.tag}` : service.image;
	if (service.containerName.trim()) entry.container_name = service.containerName.trim();

	const ports = service.ports.filter(port => port.host.trim() && port.container.trim());
	if (ports.length > 0) entry.ports = ports.map(port => `${port.host.trim()}:${port.container.trim()}`);

	const environment = service.environment.filter(env => env.enabled && env.key.trim());
	if (environment.length > 0) {
		entry.environment = Object.fromEntries(environment.map(env => [env.key.trim(), env.value]));
	}

	const volumes = service.volumes.filter(volume => volume.source.trim() && volume.target.trim());
	if (volumes.length > 0) entry.volumes = volumes.map(volume => `${volume.source.trim()}:${volume.target.trim()}`);

	const networks = service.networks.filter(network => network.trim());
	if (networks.length > 0) entry.networks = networks;

	if (service.restart !== "no") entry.restart = service.restart;

	const dependsOn = service.dependsOn.filter(name => name.trim());
	if (dependsOn.length > 0) entry.depends_on = dependsOn;

	return entry;
}

/** Generates a docker-compose.yml, validating it re-parses to the same structure before returning it. */
export function generateDockerCompose(config: DockerComposeConfig): string {
	const validServices = config.services.filter(service => service.name.trim() && service.image.trim());
	if (validServices.length === 0) return "";

	const services: Record<string, unknown> = {};
	const namedVolumes = new Set<string>();

	for (const service of validServices) {
		services[service.name.trim()] = buildServiceEntry(service);
		for (const volume of service.volumes) {
			if (volume.source.trim() && volume.target.trim() && isNamedVolume(volume.source.trim())) {
				namedVolumes.add(volume.source.trim());
			}
		}
	}

	const document: Record<string, unknown> = { services };
	if (namedVolumes.size > 0) {
		document.volumes = Object.fromEntries([...namedVolumes].map(name => [name, null]));
	}

	const rawBody = yaml.dump(document, { indent: 2, lineWidth: -1, noRefs: true });
	// A named volume with no options is conventionally written as `name:` with nothing after — `null`
	// is what js-yaml emits for that value, and both parse identically, but this matches the convention.
	const body = rawBody.replace(/^(\s+\S+): null$/gm, "$1:");

	// Fail loudly rather than ever showing the user YAML that doesn't actually parse.
	const reparsed = yaml.load(body);
	if (typeof reparsed !== "object" || reparsed === null) {
		throw new Error("Generated docker-compose.yml failed to validate — this is a bug in the generator.");
	}

	return `${SECRET_NOTICE}\n${body}`;
}
