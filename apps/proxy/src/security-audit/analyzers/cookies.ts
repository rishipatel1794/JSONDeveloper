import type { CookieFinding, Finding } from "../types";

/** Never returns or stores the real value — only whether one was present and its length, for display. */
function maskCookieValue(value: string): string {
  if (!value) return "";
  return "*".repeat(Math.min(value.length, 8));
}

function parseOneSetCookie(raw: string): CookieFinding | null {
  const segments = raw.split(";").map(segment => segment.trim());
  const [nameValue, ...attributes] = segments;
  if (!nameValue) return null;

  const equalsIndex = nameValue.indexOf("=");
  if (equalsIndex === -1) return null;

  const name = nameValue.slice(0, equalsIndex).trim();
  const value = nameValue.slice(equalsIndex + 1).trim();
  if (!name) return null;

  let secure = false;
  let httpOnly = false;
  let sameSite: CookieFinding["sameSite"] = null;
  let domain: string | null = null;
  let path: string | null = null;
  let maxAge: number | null = null;
  let expires: string | null = null;

  for (const attribute of attributes) {
    const [rawKey, ...rawVal] = attribute.split("=");
    const key = rawKey?.trim().toLowerCase();
    const val = rawVal.join("=").trim();

    if (key === "secure") secure = true;
    else if (key === "httponly") httpOnly = true;
    else if (key === "samesite") {
      const normalized = val.toLowerCase();
      if (normalized === "strict") sameSite = "Strict";
      else if (normalized === "lax") sameSite = "Lax";
      else if (normalized === "none") sameSite = "None";
    } else if (key === "domain") domain = val;
    else if (key === "path") path = val;
    else if (key === "max-age") maxAge = Number(val) || null;
    else if (key === "expires") expires = val;
  }

  return {
    name,
    maskedValue: maskCookieValue(value),
    secure,
    httpOnly,
    sameSite,
    domain,
    path,
    maxAge,
    expires,
    hasSecurePrefix: name.startsWith("__Secure-"),
    hasHostPrefix: name.startsWith("__Host-"),
  };
}

export function parseCookies(setCookieHeaders: string[]): CookieFinding[] {
  return setCookieHeaders.map(parseOneSetCookie).filter((cookie): cookie is CookieFinding => cookie !== null);
}

export function analyzeCookies(cookies: CookieFinding[], isHttps: boolean): Finding[] {
  if (cookies.length === 0) {
    return [
      {
        id: "no-cookies-set",
        title: "No cookies observed",
        category: "Cookies",
        severity: "INFO",
        description: "This response did not set any cookies.",
        impact: "Nothing to evaluate — this page may set cookies elsewhere (e.g. after login) that this passive check on the homepage/entry URL won't see.",
        recommendation: "No action needed for this check.",
        evidence: {},
      },
    ];
  }

  const findings: Finding[] = [];

  for (const cookie of cookies) {
    const evidence = {
      name: cookie.name,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      domain: cookie.domain,
      path: cookie.path,
    };

    if (isHttps && !cookie.secure) {
      findings.push({
        id: `cookie-${cookie.name}-not-secure`,
        title: `Cookie "${cookie.name}" is missing the Secure attribute`,
        category: "Cookies",
        severity: "MEDIUM",
        description: `The Secure attribute is not set on the "${cookie.name}" cookie, even though this site is served over HTTPS.`,
        impact: "Without Secure, this cookie could also be sent over a plain HTTP connection if one is ever made to this domain (e.g. via a mixed-content request or a downgraded connection), exposing it to interception.",
        recommendation: "Add the Secure attribute to this cookie.",
        evidence,
      });
    }

    if (!cookie.httpOnly) {
      findings.push({
        id: `cookie-${cookie.name}-not-httponly`,
        title: `Cookie "${cookie.name}" is missing the HttpOnly attribute`,
        category: "Cookies",
        severity: "MEDIUM",
        description: `The HttpOnly attribute is not set on the "${cookie.name}" cookie.`,
        impact: "Without HttpOnly, this cookie is readable by JavaScript running on the page — if the site ever has an XSS issue, this cookie could be stolen through it. (This check can't tell whether the cookie needs JS access for a legitimate reason.)",
        recommendation: "Add HttpOnly unless client-side JavaScript genuinely needs to read this specific cookie.",
        evidence,
      });
    }

    if (cookie.sameSite === null) {
      findings.push({
        id: `cookie-${cookie.name}-no-samesite`,
        title: `Cookie "${cookie.name}" has no SameSite attribute`,
        category: "Cookies",
        severity: "LOW",
        description: `No SameSite attribute was found on the "${cookie.name}" cookie (browsers default to Lax when it's absent, but being explicit is safer).`,
        impact: "SameSite helps mitigate CSRF by controlling whether this cookie is sent on cross-site requests.",
        recommendation: "Set SameSite explicitly — Lax is a reasonable default; Strict is stronger where the application doesn't need cross-site navigation to carry the session.",
        evidence,
      });
    } else if (cookie.sameSite === "None" && !cookie.secure) {
      findings.push({
        id: `cookie-${cookie.name}-samesite-none-insecure`,
        title: `Cookie "${cookie.name}" uses SameSite=None without Secure`,
        category: "Cookies",
        severity: "HIGH",
        description: `SameSite=None requires the Secure attribute — browsers will reject this cookie entirely without it.`,
        impact: "Modern browsers will simply refuse to set this cookie as configured, which likely breaks whatever cross-site functionality it was meant to support.",
        recommendation: "Add the Secure attribute alongside SameSite=None.",
        evidence,
      });
    }

    if (cookie.name.toLowerCase().includes("session") && !cookie.hasSecurePrefix && !cookie.hasHostPrefix) {
      findings.push({
        id: `cookie-${cookie.name}-no-prefix`,
        title: `Cookie "${cookie.name}" doesn't use a __Secure- or __Host- prefix`,
        category: "Cookies",
        severity: "INFO",
        description: `This looks like a session-related cookie without a security-prefixed name.`,
        impact: "The __Host- prefix (strictest) or __Secure- prefix gives browsers an extra, name-enforced guarantee about how the cookie can be set, as defense-in-depth beyond the individual attributes.",
        recommendation: "Consider renaming to __Host-<name> (requires Secure, Path=/, no Domain) or __Secure-<name> (requires Secure) for extra assurance.",
        evidence,
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      id: "cookies-look-good",
      title: "Observed cookies are configured securely",
      category: "Cookies",
      severity: "PASS",
      description: `Checked ${cookies.length} cookie(s); no issues found among the attributes this tool inspects.`,
      impact: "Good cookie hygiene reduces the impact of several common attack classes (session theft, CSRF, cookie injection over insecure connections).",
      recommendation: "No action needed.",
      evidence: { cookieCount: cookies.length },
    });
  }

  return findings;
}
