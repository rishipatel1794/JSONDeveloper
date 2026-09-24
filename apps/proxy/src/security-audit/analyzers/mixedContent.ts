import type { Finding } from "../types";

const RESOURCE_ATTRIBUTE_PATTERN = /<(script|link|img|iframe|source|audio|video)\b[^>]*?\s(?:src|href)\s*=\s*["'](http:\/\/[^"']+)["']/gi;
const FORM_PATTERN = /<form\b[^>]*>/gi;
const FORM_ACTION_PATTERN = /action\s*=\s*["']([^"']*)["']/i;
const FORM_PASSWORD_INPUT_NEARBY = /<input\b[^>]*type\s*=\s*["']password["']/i;
const INLINE_SCRIPT_PATTERN = /<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
const EXTERNAL_SCRIPT_PATTERN = /<script\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["']/gi;

/**
 * Regex-based, deliberately not a full HTML parser — this is a passive best-effort scan of the raw
 * markup, not a DOM evaluation, and never executes any script. It can miss content injected purely by
 * client-side JavaScript after load, or produce an occasional false match on unusual markup; that
 * tradeoff is intentional to avoid adding an HTML/DOM parsing dependency for a supplementary check.
 */
export function analyzeMixedContentAndHtml(html: string, pageIsHttps: boolean, pageUrl: string): Finding[] {
  const findings: Finding[] = [];

  if (pageIsHttps) {
    const mixedResources = new Set<string>();
    for (const match of html.matchAll(RESOURCE_ATTRIBUTE_PATTERN)) {
      mixedResources.add(match[2]!);
    }

    if (mixedResources.size > 0) {
      const examples = [...mixedResources].slice(0, 10);
      findings.push({
        id: "mixed-content-found",
        title: "Mixed content detected",
        category: "Mixed Content",
        severity: "MEDIUM",
        description: `${mixedResources.size} HTTP resource${mixedResources.size === 1 ? "" : "s"} found on an HTTPS page.`,
        impact: "Loading resources over plain HTTP on an HTTPS page lets a network attacker tamper with those specific resources (e.g. inject malicious JavaScript via an HTTP <script> tag) even though the page itself is encrypted. Browsers block the most dangerous cases (active mixed content like scripts) outright in many configurations, but this is still worth fixing at the source.",
        recommendation: "Change these resource URLs to HTTPS (or protocol-relative //), or serve them from the same HTTPS origin.",
        evidence: { count: mixedResources.size, resources: examples },
      });
    } else {
      findings.push({
        id: "no-mixed-content",
        title: "No mixed content detected",
        category: "Mixed Content",
        severity: "PASS",
        description: "No HTTP resource references were found in the fetched HTML.",
        impact: "Good — all resources referenced in the markup are HTTPS or protocol-relative.",
        recommendation: "No action needed. Note this check only sees resources referenced directly in the initial HTML, not ones added later by JavaScript.",
        evidence: {},
      });
    }
  }

  for (const formMatch of html.matchAll(FORM_PATTERN)) {
    const formTag = formMatch[0];
    const actionMatch = FORM_ACTION_PATTERN.exec(formTag);
    const action = actionMatch?.[1] ?? "";

    let resolvedAction: string;
    try {
      resolvedAction = new URL(action || pageUrl, pageUrl).toString();
    } catch {
      continue;
    }

    if (resolvedAction.startsWith("http://")) {
      const snippetAfterForm = html.slice(formMatch.index, formMatch.index + 2000);
      const hasPasswordField = FORM_PASSWORD_INPUT_NEARBY.test(snippetAfterForm);

      findings.push({
        id: hasPasswordField ? "password-form-over-http" : "form-over-http",
        title: hasPasswordField ? "Password form submits over plain HTTP" : "Form submits over plain HTTP",
        category: "Mixed Content",
        severity: hasPasswordField ? "HIGH" : "MEDIUM",
        description: `A <form> submits to ${resolvedAction}.`,
        impact: hasPasswordField
          ? "This form appears to include a password field and submits over an unencrypted connection — the credentials would be sent in plain text, readable by anyone on the network path."
          : "Form data submitted over plain HTTP travels unencrypted and can be intercepted or tampered with on the network path.",
        recommendation: "Change the form's action to an HTTPS URL.",
        evidence: { action: resolvedAction, hasPasswordField },
      });
    }
  }

  const inlineScriptCount = [...html.matchAll(INLINE_SCRIPT_PATTERN)].filter(match => match[1]?.trim()).length;
  if (inlineScriptCount > 0) {
    findings.push({
      id: "inline-scripts-present",
      title: `${inlineScriptCount} inline script block${inlineScriptCount === 1 ? "" : "s"} found`,
      category: "Content Security",
      severity: "INFO",
      description: "Inline <script> blocks (without a src attribute) are present in the page.",
      impact: "Inline scripts are harder to control with a strict Content-Security-Policy (they require 'unsafe-inline', or a nonce/hash per script) than externally-hosted ones.",
      recommendation: "Not inherently a problem, but worth knowing about when tightening a CSP — moving inline scripts to external files makes stricter policies easier to adopt.",
      evidence: { count: inlineScriptCount },
    });
  }

  const externalScriptHosts = new Set<string>();
  for (const match of html.matchAll(EXTERNAL_SCRIPT_PATTERN)) {
    try {
      const scriptUrl = new URL(match[1]!, pageUrl);
      const pageHost = new URL(pageUrl).hostname;
      if (scriptUrl.hostname !== pageHost) externalScriptHosts.add(scriptUrl.hostname);
    } catch {
      // ignore unparsable src values
    }
  }

  if (externalScriptHosts.size > 0) {
    findings.push({
      id: "third-party-scripts",
      title: `${externalScriptHosts.size} third-party script source${externalScriptHosts.size === 1 ? "" : "s"} found`,
      category: "Information Disclosure",
      severity: "INFO",
      description: `Scripts are loaded from: ${[...externalScriptHosts].join(", ")}.`,
      impact: "Each third-party script host is a piece of the site's trust boundary — if any of them were compromised, they could serve malicious code to this site's visitors. This is extremely common and often necessary (analytics, ads, widgets); it's listed for awareness, not as a finding to \"fix\".",
      recommendation: "Periodically review third-party script dependencies, and consider Subresource Integrity (SRI) for ones that support it.",
      evidence: { hosts: [...externalScriptHosts] },
    });
  }

  return findings;
}
