import type { Finding, FixExample } from "../types";

function header(headers: Headers, name: string): string | null {
  return headers.get(name);
}

const CSP_FIX: FixExample[] = [
  { platform: "Express.js", code: `app.use((req, res, next) => {\n  res.setHeader(\n    "Content-Security-Policy",\n    "default-src 'self'; script-src 'self'; object-src 'none'",\n  );\n  next();\n});` },
  { platform: "Nginx", code: `add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'" always;` },
  { platform: "Cloudflare Workers", code: `response.headers.set(\n  "Content-Security-Policy",\n  "default-src 'self'; script-src 'self'; object-src 'none'",\n);` },
];

const HSTS_FIX: FixExample[] = [
  { platform: "Express.js", code: `app.use((req, res, next) => {\n  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");\n  next();\n});` },
  { platform: "Nginx", code: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;` },
  { platform: "Cloudflare Pages", code: `# _headers file\n/*\n  Strict-Transport-Security: max-age=31536000; includeSubDomains` },
];

const XCTO_FIX: FixExample[] = [
  { platform: "Express.js", code: `app.use((req, res, next) => {\n  res.setHeader("X-Content-Type-Options", "nosniff");\n  next();\n});` },
  { platform: "Nginx", code: `add_header X-Content-Type-Options "nosniff" always;` },
];

const XFO_FIX: FixExample[] = [
  { platform: "Express.js", code: `app.use((req, res, next) => {\n  res.setHeader("X-Frame-Options", "SAMEORIGIN");\n  next();\n});` },
  { platform: "Nginx", code: `add_header X-Frame-Options "SAMEORIGIN" always;` },
];

const REFERRER_FIX: FixExample[] = [
  { platform: "Express.js", code: `app.use((req, res, next) => {\n  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");\n  next();\n});` },
  { platform: "Nginx", code: `add_header Referrer-Policy "strict-origin-when-cross-origin" always;` },
];

export function analyzeHsts(headers: Headers, isHttps: boolean): Finding[] {
  const value = header(headers, "strict-transport-security");
  const evidence = { header: value };

  if (!isHttps) {
    return [
      {
        id: "hsts-not-applicable",
        title: "HSTS not applicable over plain HTTP",
        category: "HTTPS",
        severity: "INFO",
        description: "Strict-Transport-Security only has any effect when served over HTTPS — this response was fetched over plain HTTP.",
        impact: "None directly; this is informational until HTTPS is available.",
        recommendation: "Once HTTPS is available, add HSTS there.",
        evidence,
      },
    ];
  }

  if (!value) {
    return [
      {
        id: "missing-hsts",
        title: "Strict-Transport-Security (HSTS) is missing",
        category: "HTTPS",
        severity: "MEDIUM",
        description: "No Strict-Transport-Security header was returned on the HTTPS response.",
        impact: "Without HSTS, a browser that has only ever reached this site over plain HTTP (or an attacker performing a downgrade) can be tricked into an insecure connection on a shared or hostile network, even if the server itself always redirects HTTP to HTTPS.",
        recommendation: "Add a Strict-Transport-Security header with a meaningful max-age once you're confident the site should always be served over HTTPS.",
        evidence,
        fixes: HSTS_FIX,
      },
    ];
  }

  const maxAgeMatch = /max-age=(\d+)/i.exec(value);
  const maxAge = maxAgeMatch ? Number(maxAgeMatch[1]) : 0;
  const includesSubDomains = /includesubdomains/i.test(value);
  const hasPreload = /preload/i.test(value);

  if (maxAge < 15_768_000) {
    // Half a year — a common practical threshold below which HSTS caching barely protects anyone.
    return [
      {
        id: "weak-hsts-max-age",
        title: "HSTS max-age is too short to be very effective",
        category: "HTTPS",
        severity: "LOW",
        description: `HSTS is present but max-age is only ${maxAge} seconds.`,
        impact: "A short max-age means browsers stop enforcing HTTPS-only access for this site again soon after a visitor's last visit, narrowing the protection window HSTS is meant to provide.",
        recommendation: "Consider a longer max-age (a year — 31536000 — is a common choice) once you're confident HTTPS will remain fully available.",
        evidence: { ...evidence, maxAge, includesSubDomains, preload: hasPreload },
        fixes: HSTS_FIX,
      },
    ];
  }

  return [
    {
      id: "hsts-present",
      title: "HSTS is configured",
      category: "HTTPS",
      severity: "PASS",
      description: `Strict-Transport-Security is present with max-age=${maxAge}${includesSubDomains ? ", includeSubDomains" : ""}${hasPreload ? ", preload" : ""}.`,
      impact: "Browsers that have visited this site will enforce HTTPS-only access for the configured duration.",
      recommendation: includesSubDomains
        ? "This looks solid. Preload submission is a further step, but only appropriate if every subdomain genuinely supports HTTPS — that isn't something this tool can verify, so it isn't recommended automatically."
        : "Consider adding includeSubDomains if every subdomain of this site also supports HTTPS.",
      evidence: { ...evidence, maxAge, includesSubDomains, preload: hasPreload },
    },
  ];
}

export function analyzeXContentTypeOptions(headers: Headers): Finding {
  const value = header(headers, "x-content-type-options");

  if (value?.toLowerCase() === "nosniff") {
    return {
      id: "xcto-present",
      title: "X-Content-Type-Options is set correctly",
      category: "Security Headers",
      severity: "PASS",
      description: "X-Content-Type-Options: nosniff is present.",
      impact: "Browsers are instructed not to guess ('sniff') a response's MIME type, which prevents a handful of MIME-confusion based attacks.",
      recommendation: "No action needed.",
      evidence: { header: value },
    };
  }

  return {
    id: "missing-xcto",
    title: "X-Content-Type-Options is missing",
    category: "Security Headers",
    severity: "LOW",
    description: "No X-Content-Type-Options: nosniff header was found.",
    impact: "Without this header, some browsers may try to guess a response's content type rather than trusting the declared Content-Type, which has historically enabled certain MIME-sniffing attacks.",
    recommendation: "Add X-Content-Type-Options: nosniff.",
    evidence: { header: value },
    fixes: XCTO_FIX,
  };
}

export function analyzeClickjacking(headers: Headers, cspFrameAncestors: string | null): Finding {
  const xfo = header(headers, "x-frame-options");
  const evidence = { xFrameOptions: xfo, cspFrameAncestors };

  if (cspFrameAncestors) {
    return {
      id: "clickjacking-protected-csp",
      title: "Clickjacking protection: protected (via CSP frame-ancestors)",
      category: "Security Headers",
      severity: "PASS",
      description: `Content-Security-Policy sets frame-ancestors ${cspFrameAncestors}, which modern browsers use in preference to X-Frame-Options.`,
      impact: "This restricts which sites can embed the page in a frame/iframe, mitigating clickjacking.",
      recommendation: "No action needed. X-Frame-Options can still be kept as a fallback for older browsers if useful.",
      evidence,
    };
  }

  if (xfo && /^(deny|sameorigin)$/i.test(xfo.trim())) {
    return {
      id: "clickjacking-protected-xfo",
      title: "Clickjacking protection: protected (via X-Frame-Options)",
      category: "Security Headers",
      severity: "PASS",
      description: `X-Frame-Options: ${xfo} is present.`,
      impact: "This restricts whether the page can be embedded in a frame/iframe on another site, mitigating clickjacking.",
      recommendation: "Consider also adding a CSP frame-ancestors directive, which offers more flexibility and is preferred by modern browsers.",
      evidence,
    };
  }

  if (xfo) {
    return {
      id: "clickjacking-partial",
      title: "Clickjacking protection: partially protected",
      category: "Security Headers",
      severity: "LOW",
      description: `X-Frame-Options is present but set to an unrecognized value: "${xfo}".`,
      impact: "Browser support for X-Frame-Options values beyond DENY/SAMEORIGIN is inconsistent, so this may not reliably prevent framing in every browser.",
      recommendation: "Use X-Frame-Options: SAMEORIGIN (or DENY), or move to a CSP frame-ancestors directive.",
      evidence,
      fixes: XFO_FIX,
    };
  }

  return {
    id: "clickjacking-not-detected",
    title: "Clickjacking protection: not detected",
    category: "Security Headers",
    severity: "MEDIUM",
    description: "Neither X-Frame-Options nor a CSP frame-ancestors directive was found.",
    impact: "Without one of these, another site could potentially embed this page in a frame/iframe and attempt to trick users into interacting with it unintentionally (clickjacking). Whether this matters in practice depends heavily on what the page lets a user do.",
    recommendation: "Add X-Frame-Options: SAMEORIGIN, or a CSP frame-ancestors directive, unless this page is deliberately meant to be embeddable by other sites.",
    evidence,
    fixes: XFO_FIX,
  };
}

export function analyzeReferrerPolicy(headers: Headers): Finding {
  const value = header(headers, "referrer-policy");
  const evidence = { header: value };

  const RECOGNIZED = new Set([
    "no-referrer",
    "no-referrer-when-downgrade",
    "same-origin",
    "origin",
    "strict-origin",
    "origin-when-cross-origin",
    "strict-origin-when-cross-origin",
    "unsafe-url",
  ]);

  if (!value) {
    return {
      id: "missing-referrer-policy",
      title: "Referrer-Policy is missing",
      category: "Security Headers",
      severity: "LOW",
      description: "No Referrer-Policy header was found.",
      impact: "Without an explicit policy, the browser's default referrer behavior applies, which can leak full URLs (including any sensitive query-string data) to third-party destinations when a user follows a link away from this page.",
      recommendation: "Add a Referrer-Policy header — strict-origin-when-cross-origin is a reasonable, widely-used default.",
      evidence,
      fixes: REFERRER_FIX,
    };
  }

  const values = value
    .split(",")
    .map(part => part.trim().toLowerCase())
    .filter(Boolean);
  const unsafe = values.includes("unsafe-url");
  const recognized = values.every(part => RECOGNIZED.has(part));

  if (unsafe) {
    return {
      id: "unsafe-referrer-policy",
      title: "Referrer-Policy allows full URL leakage",
      category: "Security Headers",
      severity: "LOW",
      description: `Referrer-Policy is set to "${value}".`,
      impact: "unsafe-url sends the full referring URL (including path and query string) on every navigation and request, even to other origins — this can leak sensitive URL data if any is ever present.",
      recommendation: "Prefer a more conservative value such as strict-origin-when-cross-origin unless the full referrer is genuinely needed.",
      evidence,
    };
  }

  return {
    id: "referrer-policy-present",
    title: "Referrer-Policy is configured",
    category: "Security Headers",
    severity: "PASS",
    description: `Referrer-Policy is set to "${value}"${recognized ? "" : " (contains an unrecognized value)"}.`,
    impact: "Controls how much referrer information is sent to other sites when a user navigates away.",
    recommendation: "No action needed.",
    evidence,
  };
}

const SENSITIVE_PERMISSIONS = ["camera", "microphone", "geolocation", "payment", "usb"];

export function analyzePermissionsPolicy(headers: Headers): Finding {
  const value = header(headers, "permissions-policy");
  const evidence = { header: value };

  if (!value) {
    return {
      id: "missing-permissions-policy",
      title: "Permissions-Policy is missing",
      category: "Security Headers",
      severity: "INFO",
      description: "No Permissions-Policy header was found.",
      impact: "This header lets a site explicitly disable powerful browser features (camera, microphone, geolocation, payment APIs, USB, and others) it doesn't use. Its absence isn't inherently a vulnerability — most sites never set it — but it's a missed opportunity to reduce what a compromised or malicious embedded script could access.",
      recommendation: "Consider adding a Permissions-Policy that disables any sensitive browser features this site doesn't actually use.",
      evidence,
    };
  }

  const restricted = SENSITIVE_PERMISSIONS.filter(feature => new RegExp(`${feature}=\\(\\s*\\)`, "i").test(value));

  return {
    id: "permissions-policy-present",
    title: "Permissions-Policy is configured",
    category: "Security Headers",
    severity: "PASS",
    description: restricted.length > 0 ? `Permissions-Policy restricts: ${restricted.join(", ")}.` : "Permissions-Policy is present.",
    impact: "Explicitly controls which powerful browser features are available to this page and any content it embeds.",
    recommendation: "No action needed. Review the policy periodically as the site's actual feature usage changes.",
    evidence: { ...evidence, restrictedSensitiveFeatures: restricted },
  };
}

export function analyzeCrossOriginIsolationHeaders(headers: Headers): Finding[] {
  const findings: Finding[] = [];
  const coop = header(headers, "cross-origin-opener-policy");
  const corp = header(headers, "cross-origin-resource-policy");
  const coep = header(headers, "cross-origin-embedder-policy");

  findings.push({
    id: coop ? "coop-present" : "missing-coop",
    title: coop ? "Cross-Origin-Opener-Policy is configured" : "Cross-Origin-Opener-Policy is missing",
    category: "Security Headers",
    severity: coop ? "PASS" : "INFO",
    description: coop ? `Cross-Origin-Opener-Policy: ${coop}` : "No Cross-Origin-Opener-Policy header was found.",
    impact: "COOP isolates this page's browsing context from cross-origin popups/openers, mitigating certain cross-origin attacks (e.g. some Spectre-style side channels and tab-napping variants).",
    recommendation: coop ? "No action needed." : "Consider same-origin (or same-origin-allow-popups if the site relies on cross-origin popups) if this isn't already something the application depends on breaking.",
    evidence: { header: coop },
  });

  findings.push({
    id: corp ? "corp-present" : "missing-corp",
    title: corp ? "Cross-Origin-Resource-Policy is configured" : "Cross-Origin-Resource-Policy is missing",
    category: "Security Headers",
    severity: corp ? "PASS" : "INFO",
    description: corp ? `Cross-Origin-Resource-Policy: ${corp}` : "No Cross-Origin-Resource-Policy header was found.",
    impact: "CORP controls whether other origins can load this response as a resource (e.g. via <img> or <script>), which can help contain certain cross-origin information leaks.",
    recommendation: corp ? "No action needed." : "Consider same-origin or same-site if this response isn't meant to be embedded cross-origin.",
    evidence: { header: corp },
  });

  findings.push({
    id: coep ? "coep-present" : "missing-coep",
    title: coep ? "Cross-Origin-Embedder-Policy is configured" : "Cross-Origin-Embedder-Policy is missing",
    category: "Security Headers",
    severity: coep ? "PASS" : "INFO",
    description: coep ? `Cross-Origin-Embedder-Policy: ${coep}` : "No Cross-Origin-Embedder-Policy header was found.",
    impact: "COEP is mainly relevant to pages that need cross-origin isolation (e.g. to use SharedArrayBuffer). Most sites have no need for it.",
    recommendation: coep ? "No action needed." : "Only relevant if this site needs cross-origin isolation for specific browser APIs.",
    evidence: { header: coep },
  });

  return findings;
}

export function analyzeCacheControl(headers: Headers): Finding {
  const cacheControl = header(headers, "cache-control");
  const pragma = header(headers, "pragma");

  return {
    id: "cache-control-info",
    title: "Cache-Control / Pragma",
    category: "Security Headers",
    severity: "INFO",
    description: cacheControl ? `Cache-Control: ${cacheControl}${pragma ? `, Pragma: ${pragma}` : ""}` : "No Cache-Control header was found on this response.",
    impact: "Caching directives matter most for pages that render sensitive, user-specific data — those should generally use no-store to prevent that content from being cached by shared proxies or browser history.",
    recommendation: "For any page containing sensitive or personalized content, ensure Cache-Control: no-store is set. For static, public content, sensible caching is fine and improves performance.",
    evidence: { cacheControl, pragma },
  };
}

export function analyzeClearSiteData(headers: Headers): Finding | null {
  const value = header(headers, "clear-site-data");
  if (!value) return null;

  return {
    id: "clear-site-data-present",
    title: "Clear-Site-Data is set",
    category: "Security Headers",
    severity: "INFO",
    description: `Clear-Site-Data: ${value}`,
    impact: "This instructs the browser to clear the specified type(s) of stored data (cookies, cache, storage) for this origin — typically used on logout endpoints.",
    recommendation: "Confirm this is only sent where intended (e.g. a logout response), since it clears data for every visitor who receives it.",
    evidence: { header: value },
  };
}

export function getCspHeaderFinding(headers: Headers): { value: string | null; finding: Finding | null } {
  const value = header(headers, "content-security-policy") ?? header(headers, "content-security-policy-report-only");
  const reportOnly = !header(headers, "content-security-policy") && Boolean(header(headers, "content-security-policy-report-only"));

  if (!value) {
    return {
      value: null,
      finding: {
        id: "missing-csp",
        title: "Content Security Policy is missing",
        category: "Content Security",
        severity: "HIGH",
        description: "No Content-Security-Policy header was detected.",
        impact: "A Content-Security-Policy can restrict which scripts, styles, frames, images, and other resources a browser is allowed to load, which meaningfully raises the bar for cross-site scripting and some data-injection attacks. Its absence doesn't automatically mean this site is vulnerable — that depends entirely on the application's other defenses — but CSP is one of the more effective headers when one is missing.",
        recommendation: "Configure a Content-Security-Policy appropriate for this application's actual script/style/resource sources. Start restrictive (default-src 'self') and loosen only where genuinely needed.",
        evidence: { header: null },
        fixes: CSP_FIX,
      },
    };
  }

  if (reportOnly) {
    return {
      value,
      finding: {
        id: "csp-report-only",
        title: "Content-Security-Policy is in report-only mode",
        category: "Content Security",
        severity: "MEDIUM",
        description: "Only Content-Security-Policy-Report-Only was found — the policy is being evaluated but not enforced.",
        impact: "Report-only mode is a legitimate, common step while testing a policy, but it doesn't actually block anything yet.",
        recommendation: "Once the reported violations look expected, switch to an enforcing Content-Security-Policy header.",
        evidence: { header: value },
      },
    };
  }

  return { value, finding: null };
}
