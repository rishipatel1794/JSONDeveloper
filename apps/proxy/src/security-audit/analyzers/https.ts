import type { Finding, HttpsInfo } from "../types";

export function analyzeHttps(info: HttpsInfo): Finding[] {
  const findings: Finding[] = [];

  if (!info.httpsAvailable) {
    findings.push({
      id: "https-unavailable",
      title: "HTTPS is not available",
      category: "HTTPS",
      severity: "CRITICAL",
      description: "This site could not be reached over HTTPS.",
      impact: "All traffic to this site — including any forms, cookies, or credentials — travels unencrypted and can be read or modified by anyone on the network path.",
      recommendation: "Obtain a TLS certificate (e.g. via Let's Encrypt) and serve the site over HTTPS.",
      evidence: { finalUrl: info.finalUrl, finalStatus: info.finalStatus },
    });
    return findings;
  }

  findings.push({
    id: "https-available",
    title: "HTTPS is available",
    category: "HTTPS",
    severity: "PASS",
    description: "This site is reachable over HTTPS.",
    impact: "Traffic to this site can be encrypted in transit.",
    recommendation: "No action needed for this check.",
    evidence: { finalUrl: info.finalUrl },
  });

  if (info.httpAvailable) {
    if (info.httpRedirectsToHttps) {
      findings.push({
        id: "http-redirects-to-https",
        title: "HTTP redirects to HTTPS",
        category: "HTTPS",
        severity: "PASS",
        description: "Requesting this site over plain HTTP redirects to HTTPS.",
        impact: "Visitors who type the domain without https:// (or follow an old HTTP link) still end up on the encrypted version.",
        recommendation: "No action needed. Pair this with HSTS so browsers remember to go straight to HTTPS next time.",
        evidence: { redirectChain: info.redirectChain },
      });
    } else {
      findings.push({
        id: "http-does-not-redirect",
        title: "HTTP does not redirect to HTTPS",
        category: "HTTPS",
        severity: "HIGH",
        description: "This site responds over plain HTTP without redirecting to HTTPS.",
        impact: "A visitor who reaches the HTTP version (e.g. via an old link, typed URL, or a network attacker's downgrade attempt) stays on an unencrypted connection for that entire visit.",
        recommendation: "Configure the server to redirect all HTTP requests to HTTPS.",
        evidence: { finalUrl: info.finalUrl, finalStatus: info.finalStatus },
      });
    }
  }

  findings.push({
    id: "tls-certificate-not-inspected",
    title: "TLS certificate details are not inspected",
    category: "HTTPS",
    severity: "INFO",
    description: "This tool's current runtime does not expose the underlying TLS connection, so certificate subject, issuer, SAN, and expiration are not available here.",
    impact: "No impact — this is a limitation of what this tool can currently observe, not a finding about the target site's certificate.",
    recommendation: "Use a dedicated TLS-checking tool (e.g. your browser's certificate viewer, or `openssl s_client`) if you need certificate details.",
    evidence: {},
  });

  return findings;
}
