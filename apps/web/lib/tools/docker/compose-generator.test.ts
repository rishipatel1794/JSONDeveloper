import * as yaml from "js-yaml";
import { describe, expect, it } from "vitest";

import { generateDockerCompose } from "./compose-generator";
import { createServiceFromPreset } from "./presets";
import type { DockerComposeConfig } from "./types";

function config(...services: ReturnType<typeof createServiceFromPreset>[]): DockerComposeConfig {
	return { services };
}

describe("generateDockerCompose", () => {
	it("generates a single service", () => {
		const output = generateDockerCompose(config(createServiceFromPreset("node")));
		const parsed = yaml.load(output) as { services: Record<string, unknown> };

		expect(parsed.services).toHaveProperty("node");
		expect(output).toContain("image: node:20-alpine");
	});

	it("generates multiple services", () => {
		const output = generateDockerCompose(config(createServiceFromPreset("node"), createServiceFromPreset("postgres")));
		const parsed = yaml.load(output) as { services: Record<string, unknown> };

		expect(Object.keys(parsed.services)).toEqual(["node", "postgres"]);
	});

	it("generates a PostgreSQL service with the documented preset shape", () => {
		const output = generateDockerCompose(config(createServiceFromPreset("postgres")));
		const parsed = yaml.load(output) as {
			services: { postgres: { image: string; environment: Record<string, string>; ports: string[]; volumes: string[] } };
			volumes: Record<string, unknown>;
		};

		expect(parsed.services.postgres.image).toBe("postgres:17");
		expect(parsed.services.postgres.environment).toEqual({ POSTGRES_DB: "app", POSTGRES_USER: "postgres", POSTGRES_PASSWORD: "change-me" });
		expect(parsed.services.postgres.ports).toEqual(["5432:5432"]);
		expect(parsed.services.postgres.volumes).toEqual(["postgres_data:/var/lib/postgresql/data"]);
		expect(parsed.volumes).toHaveProperty("postgres_data");
	});

	it("generates a Redis service", () => {
		const output = generateDockerCompose(config(createServiceFromPreset("redis")));
		const parsed = yaml.load(output) as { services: { redis: { image: string } } };
		expect(parsed.services.redis.image).toBe("redis:7-alpine");
	});

	it("uses placeholder secrets, never a hardcoded real-looking password", () => {
		const output = generateDockerCompose(config(createServiceFromPreset("postgres")));
		expect(output).toContain("change-me");
		expect(output.toLowerCase()).not.toMatch(/password:\s*(?!change-me)\S{4,}/);
	});

	it("includes environment variables", () => {
		const service = createServiceFromPreset("node");
		service.environment.push({ id: "x", key: "PORT", value: "3000", enabled: true });
		const output = generateDockerCompose(config(service));
		const parsed = yaml.load(output) as { services: { node: { environment: Record<string, string> } } };
		expect(parsed.services.node.environment.PORT).toBe("3000");
	});

	it("omits disabled environment variables", () => {
		const service = createServiceFromPreset("node");
		service.environment.push({ id: "x", key: "DEBUG", value: "true", enabled: false });
		const output = generateDockerCompose(config(service));
		expect(output).not.toContain("DEBUG");
	});

	it("declares a top-level volume only for named volumes, not bind mounts", () => {
		const service = createServiceFromPreset("custom");
		service.name = "app";
		service.image = "alpine";
		service.volumes = [
			{ id: "1", source: "./src", target: "/app/src" },
			{ id: "2", source: "app_data", target: "/data" },
		];
		const output = generateDockerCompose(config(service));
		const parsed = yaml.load(output) as { volumes?: Record<string, unknown> };

		expect(parsed.volumes).toEqual({ app_data: null });
		expect(output).not.toContain("./src:\n");
	});

	it("skips a service with no name or image", () => {
		const service = createServiceFromPreset("custom");
		expect(generateDockerCompose(config(service))).toBe("");
	});

	it("always produces output that re-parses as valid YAML", () => {
		const output = generateDockerCompose(config(createServiceFromPreset("node"), createServiceFromPreset("postgres"), createServiceFromPreset("redis")));
		expect(() => yaml.load(output)).not.toThrow();
	});

	it("is deterministic for the same config", () => {
		const service = createServiceFromPreset("postgres");
		expect(generateDockerCompose(config(service))).toBe(generateDockerCompose(config(service)));
	});
});
