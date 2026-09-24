import type { Finding } from "../types";

const DISCLOSURE_HEADERS = ["server", "x-powered-by", "x-aspnet-version", "x-aspnetmvc-version", "x-generator", "x-drupal-cache"];

/**
 * Passively notes technology-identifying headers. Deliberately INFO severity, never higher — the
 * presence of these headers is not itself a vulnerability, just a piece of information an attacker
 * doesn't strictly need to hand over for free.
 */
export function analyzeInformationDisclosure(headers: Headers): Finding[] {
  const findings: Finding[] = [];

  for (const name of DISCLOSURE_HEADERS) {
    const value = headers.get(name);
    if (!value) continue;

    findings.push({
      id: `disclosure-${name}`,
      title: `${name}: ${value}`,
      category: "Information Disclosure",
      severity: "INFO",
      description: `The response includes a ${name} header revealing technology details.`,
      impact: "This tells a visitor (or an attacker doing reconnaissance) what software/framework/version is running. It does not by itself represent a vulnerability, but reduces the effort needed to look up known issues for that specific version.",
      recommendation: `Consider removing or genericizing the ${name} header if it isn't otherwise useful to expose.`,
      evidence: { header: name, value },
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: "no-disclosure-headers",
      title: "No common technology-disclosure headers found",
      category: "Information Disclosure",
      severity: "PASS",
      description: "None of the commonly-checked technology-identifying headers (Server, X-Powered-By, and similar) were present.",
      impact: "Slightly reduces the information available to passive reconnaissance.",
      recommendation: "No action needed.",
      evidence: {},
    });
  }

  return findings;
}
