import { isPlainObject } from "./openapi-parser";
import type { ImportedServer, ImportedServerVariable, OpenApiVersion } from "./types";

const FALLBACK_SERVER: ImportedServer = { label: "https://api.example.com", url: "https://api.example.com", variables: [] };

function convertOpenApi3Server(server: unknown, index: number): ImportedServer {
	if (!isPlainObject(server) || typeof server.url !== "string") {
		return { ...FALLBACK_SERVER, label: `Server ${index + 1}` };
	}

	const variableDefs = isPlainObject(server.variables) ? server.variables : {};
	const variables: ImportedServerVariable[] = [];
	let resolvedUrl = server.url;

	for (const [name, rawDef] of Object.entries(variableDefs)) {
		const def = isPlainObject(rawDef) ? rawDef : {};
		const defaultValue = typeof def.default === "string" ? def.default : "";
		const enumValues = Array.isArray(def.enum) ? def.enum.filter((value): value is string => typeof value === "string") : undefined;

		variables.push({ name, default: defaultValue, enum: enumValues });
		resolvedUrl = resolvedUrl.replace(new RegExp(`\\{${name}\\}`, "g"), defaultValue);
	}

	const description = typeof server.description === "string" ? server.description : undefined;
	return { label: description || resolvedUrl, url: resolvedUrl, variables, description };
}

/** Converts OpenAPI 3 `servers[]` or Swagger 2 `host`/`basePath`/`schemes` into a selectable server list. */
export function convertServers(document: Record<string, unknown>, version: OpenApiVersion): ImportedServer[] {
	if (version === "swagger2") {
		const host = typeof document.host === "string" && document.host ? document.host : "api.example.com";
		const basePath = typeof document.basePath === "string" ? document.basePath : "";
		const schemesList = Array.isArray(document.schemes) ? document.schemes : ["https"];
		const scheme = schemesList.includes("https") ? "https" : String(schemesList[0] ?? "https");
		const url = `${scheme}://${host}${basePath}`;
		return [{ label: url, url, variables: [] }];
	}

	const servers = Array.isArray(document.servers) ? document.servers : [];
	if (servers.length === 0) return [FALLBACK_SERVER];

	return servers.map((server, index) => convertOpenApi3Server(server, index));
}
