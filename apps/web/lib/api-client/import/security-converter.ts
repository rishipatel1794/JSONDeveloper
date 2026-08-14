import { isPlainObject } from "./openapi-parser";
import type { ImportedAuth, ImportedVariableSuggestion } from "./types";

export function convertSecurityScheme(scheme: Record<string, unknown>): ImportedAuth {
	const type = scheme.type;

	if (type === "apiKey") {
		const name = typeof scheme.name === "string" ? scheme.name : "X-API-Key";
		const location = scheme.in === "query" ? "query" : "header";
		return { type: "api-key", key: name, location };
	}

	if (type === "http") {
		if (scheme.scheme === "basic") return { type: "basic" };
		return { type: "bearer" };
	}

	// Swagger 2 uses "basic" as its own top-level type rather than http+scheme.
	if (type === "basic") return { type: "basic" };

	// oauth2 / openIdConnect aren't fully modeled in V1 — once a token is obtained it's presented
	// as a bearer token in practice, so that's the closest useful mapping rather than "none".
	if (type === "oauth2" || type === "openIdConnect") return { type: "bearer" };

	return { type: "none" };
}

/**
 * Resolves the auth that actually applies to one operation: an operation-level `security` array —
 * including an explicit empty array, which deliberately disables auth — overrides global security.
 */
export function resolveEffectiveSecurity(
	globalSecurity: unknown,
	operationSecurity: unknown,
	schemes: Record<string, unknown>,
): ImportedAuth {
	const security = operationSecurity !== undefined ? operationSecurity : globalSecurity;
	if (!Array.isArray(security) || security.length === 0) return { type: "none" };

	const firstRequirement = security[0];
	if (!isPlainObject(firstRequirement)) return { type: "none" };

	const schemeName = Object.keys(firstRequirement)[0];
	if (!schemeName) return { type: "none" };

	const scheme = schemes[schemeName];
	if (!isPlainObject(scheme)) return { type: "none" };

	return convertSecurityScheme(scheme);
}

export function suggestVariablesForAuth(auth: ImportedAuth): ImportedVariableSuggestion[] {
	if (auth.type === "bearer") return [{ name: "ACCESS_TOKEN", secret: true }];
	if (auth.type === "basic") return [{ name: "USERNAME", secret: false }, { name: "PASSWORD", secret: true }];
	if (auth.type === "api-key") return [{ name: "API_KEY", secret: true }];
	return [];
}
