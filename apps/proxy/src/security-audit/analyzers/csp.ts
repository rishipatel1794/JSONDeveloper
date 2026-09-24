import type { Finding } from "../types";

const DIRECTIVES_OF_INTEREST = [
  "default-src",
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "frame-src",
  "object-src",
  "base-uri",
  "form-action",
  "frame-ancestors",
];

export function parseCspDirectives(csp: string): Map<string, string[]> {
  const directives = new Map<string, string[]>();

  for (const rawPart of csp.split(";")) {
    const part = rawPart.trim();
    if (!part) continue;

    const [name, ...values] = part.split(/\s+/);
    if (!name) continue;

    directives.set(name.toLowerCase(), values);
  }

  return directives;
}

export function getCspFrameAncestors(csp: string): string | null {
  const directives = parseCspDirectives(csp);
  const values = directives.get("frame-ancestors");
  return values && values.length > 0 ? values.join(" ") : null;
}

interface RiskyPattern {
  pattern: string;
  test: (values: string[]) => boolean;
  severity: "MEDIUM" | "LOW";
  explain: (directive: string) => string;
}

const RISKY_PATTERNS: RiskyPattern[] = [
  {
    pattern: "'unsafe-inline'",
    test: values => values.includes("'unsafe-inline'"),
    severity: "MEDIUM",
    explain: directive => `Inline ${directive === "style-src" ? "styles are" : "scripts are"} permitted by this policy, which can weaken CSP protection depending on the application's architecture.`,
  },
  {
    pattern: "'unsafe-eval'",
    test: values => values.includes("'unsafe-eval'"),
    severity: "MEDIUM",
    explain: () => "eval() and similar dynamic-code execution are permitted by this policy, which removes one of CSP's stronger protections against injected code.",
  },
  {
    pattern: "*",
    test: values => values.includes("*"),
    severity: "MEDIUM",
    explain: directive => `A wildcard source is allowed for ${directive}, meaning resources can be loaded from any origin for this directive.`,
  },
  {
    pattern: "data:",
    test: values => values.some(value => value.startsWith("data:")),
    severity: "LOW",
    explain: directive => `data: URIs are permitted for ${directive}. This is common and often fine (e.g. inline images), but can be abused to smuggle scripts/styles in some contexts.`,
  },
  {
    pattern: "blob:",
    test: values => values.some(value => value.startsWith("blob:")),
    severity: "LOW",
    explain: directive => `blob: URIs are permitted for ${directive}. Usually benign, but worth being intentional about.`,
  },
];

/**
 * Parses a Content-Security-Policy value into per-directive findings. Deliberately does not treat
 * every risky-looking token as a vulnerability on its own — the same directive/value pair can be
 * perfectly reasonable in one application's architecture and risky in another, so findings are framed
 * as "worth reviewing" rather than definitive.
 */
export function analyzeCsp(csp: string): Finding[] {
  const directives = parseCspDirectives(csp);
  const findings: Finding[] = [];

  if (!directives.has("default-src") && !directives.has("script-src")) {
    findings.push({
      id: "csp-no-default-or-script-src",
      title: "CSP has neither default-src nor script-src",
      category: "Content Security",
      severity: "MEDIUM",
      description: "The policy doesn't set default-src or script-src, so there's no fallback restriction on where scripts can load from.",
      impact: "Without either directive, script loading is effectively unrestricted by this policy, regardless of what other directives are set.",
      recommendation: "Add a default-src (as a baseline) and/or an explicit script-src.",
      evidence: { csp },
    });
  }

  if (!directives.has("object-src") && !directives.has("default-src")) {
    findings.push({
      id: "csp-no-object-src",
      title: "CSP does not restrict object-src",
      category: "Content Security",
      severity: "LOW",
      description: "No object-src directive (or default-src fallback) was found.",
      impact: "Plugin content (<object>, <embed>, <applet>) is unrestricted, which is a legacy attack surface most modern sites don't need at all.",
      recommendation: "Add object-src 'none' unless this application genuinely relies on plugin content.",
      evidence: { csp },
    });
  }

  for (const directive of DIRECTIVES_OF_INTEREST) {
    const values = directives.get(directive);
    if (!values) continue;

    for (const risky of RISKY_PATTERNS) {
      if (risky.test(values)) {
        findings.push({
          id: `csp-${directive}-${risky.pattern.replace(/[^a-z]/gi, "")}`,
          title: `${directive} ${risky.pattern}`,
          category: "Content Security",
          severity: risky.severity,
          description: `The ${directive} directive includes ${risky.pattern}.`,
          impact: risky.explain(directive),
          recommendation: risky.pattern === "'unsafe-inline'" ? "Prefer nonces or hashes where practical." : "Review whether this is intentional for this application's architecture.",
          evidence: { directive, values, csp },
        });
      }
    }
  }

  if (findings.length === 0) {
    findings.push({
      id: "csp-looks-reasonable",
      title: "Content Security Policy doesn't show common risky patterns",
      category: "Content Security",
      severity: "PASS",
      description: "No unsafe-inline, unsafe-eval, wildcard sources, or other commonly-flagged patterns were found in the parsed directives this tool checks.",
      impact: "This is a good sign, though it isn't a guarantee the policy is airtight — CSP effectiveness depends on the specific application.",
      recommendation: "No action needed from this check.",
      evidence: { csp },
    });
  }

  return findings;
}
