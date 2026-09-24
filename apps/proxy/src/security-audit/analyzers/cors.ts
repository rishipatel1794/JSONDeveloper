import type { Finding } from "../types";

export function analyzeCors(headers: Headers): Finding[] {
  const allowOrigin = headers.get("access-control-allow-origin");
  const allowCredentials = headers.get("access-control-allow-credentials");
  const allowMethods = headers.get("access-control-allow-methods");
  const allowHeaders = headers.get("access-control-allow-headers");

  const evidence = { allowOrigin, allowCredentials, allowMethods, allowHeaders };

  if (!allowOrigin) {
    return [
      {
        id: "no-cors-headers",
        title: "No CORS headers on this response",
        category: "CORS",
        severity: "INFO",
        description: "Access-Control-Allow-Origin was not found on this response.",
        impact: "This is completely normal for a regular page load — CORS headers usually only matter on API responses meant to be fetched cross-origin by other web applications.",
        recommendation: "No action needed unless this URL is meant to serve an API consumed cross-origin.",
        evidence,
      },
    ];
  }

  const isWildcard = allowOrigin.trim() === "*";
  const credentialsEnabled = allowCredentials?.trim().toLowerCase() === "true";

  if (isWildcard && credentialsEnabled) {
    // Browsers actually reject this combination outright (the CORS spec forbids ACAO: * together with
    // credentials: true) — but it's still worth flagging as a misconfiguration to fix, since it usually
    // means the requests it was meant to support are currently failing.
    return [
      {
        id: "cors-wildcard-with-credentials",
        title: "CORS allows any origin together with credentials",
        category: "CORS",
        severity: "HIGH",
        description: "Access-Control-Allow-Origin: * is combined with Access-Control-Allow-Credentials: true.",
        impact: "Browsers actually block this exact combination by spec — a wildcard origin can never be paired with credentialed requests — so in practice this likely means credentialed cross-origin requests to this endpoint are failing. If a specific origin were reflected instead of a literal wildcard, that would allow any website to make authenticated requests here using a visitor's existing session.",
        recommendation: "Replace the wildcard with an explicit, validated allowlist of trusted origins if this endpoint needs to support credentialed cross-origin requests.",
        evidence,
      },
    ];
  }

  if (isWildcard) {
    return [
      {
        id: "cors-wildcard",
        title: "CORS allows any origin",
        category: "CORS",
        severity: "LOW",
        description: "Access-Control-Allow-Origin: * allows any website to read this response cross-origin.",
        impact: "This is often perfectly intentional for public, non-sensitive API responses (e.g. public data endpoints). It only becomes a real concern if the response ever contains user-specific or sensitive data, since any site could read it on a visitor's behalf.",
        recommendation: "Fine for genuinely public data. If this response can ever contain sensitive or user-specific data, restrict Access-Control-Allow-Origin to a specific, validated allowlist instead.",
        evidence,
      },
    ];
  }

  return [
    {
      id: "cors-restricted",
      title: "CORS is restricted to a specific origin",
      category: "CORS",
      severity: "PASS",
      description: `Access-Control-Allow-Origin: ${allowOrigin}`,
      impact: "Cross-origin access to this response is limited to the specified origin.",
      recommendation: "Confirm the allowed origin is actually validated server-side against an allowlist (rather than always reflecting whatever Origin header the request sent), since blind reflection defeats the purpose of restricting it.",
      evidence,
    },
  ];
}
