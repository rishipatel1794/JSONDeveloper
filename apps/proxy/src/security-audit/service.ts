import { analyzeCookies, parseCookies } from "./analyzers/cookies";
import { analyzeCors } from "./analyzers/cors";
import { analyzeCsp, getCspFrameAncestors } from "./analyzers/csp";
import { analyzeInformationDisclosure } from "./analyzers/disclosure";
import {
  analyzeCacheControl,
  analyzeClearSiteData,
  analyzeClickjacking,
  analyzeCrossOriginIsolationHeaders,
  analyzeHsts,
  analyzePermissionsPolicy,
  analyzeReferrerPolicy,
  analyzeXContentTypeOptions,
  getCspHeaderFinding,
} from "./analyzers/headers";
import { analyzeHttps } from "./analyzers/https";
import { analyzeMixedContentAndHtml } from "./analyzers/mixedContent";
import { computeOverallScore, scoreCategories, scoreToRating, summarizeFindings } from "./scoring";
import { validateAuditTargetUrl } from "./ssrfGuard";
import type { AuditError, AuditReport, Finding, HttpsInfo, RedirectHop } from "./types";

const USER_AGENT = "JSONDeveloper-SecurityAudit/1.0 (+https://jsondeveloper.com/security-audit)";
const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 2_000_000;
// Generous relative to the SSRF guard's own DNS lookups now being capped at ~3s and cached per
// hostname for the life of one audit — most of what used to make this budget unpredictable is gone,
// so this now mostly bounds actual network time to the target, which is what it should be doing.
const FETCH_TIMEOUT_MS = 12_000;
const PROBE_TIMEOUT_MS = 8_000;

interface GuardedFetchResult {
  response: Response;
  redirectChain: RedirectHop[];
  finalUrl: string;
}

interface GuardedFetchError {
  error: string;
}

function isGuardedFetchError(result: GuardedFetchResult | GuardedFetchError): result is GuardedFetchError {
  return "error" in result;
}

/**
 * Follows redirects itself (rather than letting fetch() do it) so every hop's destination can be
 * re-validated by the SSRF guard before it's ever requested — an allowed starting hostname redirecting
 * to a private/internal address is rejected exactly like a direct request to it would be.
 */
async function fetchWithGuard(startUrl: string, signal: AbortSignal): Promise<GuardedFetchResult | GuardedFetchError> {
  let currentUrl = startUrl;
  const redirectChain: RedirectHop[] = [];

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const check = await validateAuditTargetUrl(currentUrl);
    if (!check.allowed) {
      return { error: check.reason ?? "This request target is not allowed." };
    }

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal,
        headers: { "User-Agent": USER_AGENT },
      });
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      return { error: isAbort ? "The request timed out." : "Unable to reach the target server." };
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { response, redirectChain, finalUrl: currentUrl };

      redirectChain.push({ url: currentUrl, status: response.status });

      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        return { error: "Received a redirect to an invalid URL." };
      }

      continue;
    }

    return { response, redirectChain, finalUrl: currentUrl };
  }

  return { error: "Too many redirects." };
}

/** A quick single-hop probe used only to characterize protocol availability, not for full analysis. */
async function probeAvailability(url: string, signal: AbortSignal): Promise<{ available: boolean; redirectsTo: string | null; status: number }> {
  const check = await validateAuditTargetUrl(url);
  if (!check.allowed) return { available: false, redirectsTo: null, status: 0 };

  try {
    const response = await fetch(url, { method: "GET", redirect: "manual", signal, headers: { "User-Agent": USER_AGENT } });
    const location = response.status >= 300 && response.status < 400 ? response.headers.get("location") : null;
    return { available: true, redirectsTo: location, status: response.status };
  } catch {
    return { available: false, redirectsTo: null, status: 0 };
  }
}

async function readHtmlBody(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) return "";

  const buffer = await response.arrayBuffer();
  const bytes = buffer.byteLength > MAX_HTML_BYTES ? buffer.slice(0, MAX_HTML_BYTES) : buffer;
  return new TextDecoder().decode(bytes);
}

export async function runSecurityAudit(rawUrl: string): Promise<AuditReport | AuditError> {
  const initialCheck = await validateAuditTargetUrl(rawUrl);
  if (!initialCheck.allowed) {
    return { error: initialCheck.reason ?? "This URL is not allowed." };
  }

  let parsedInput: URL;
  try {
    parsedInput = new URL(rawUrl);
  } catch {
    return { error: "Please enter a valid HTTP or HTTPS URL." };
  }

  const mainController = new AbortController();
  const mainTimeout = setTimeout(() => mainController.abort(), FETCH_TIMEOUT_MS);

  let mainResult: GuardedFetchResult | GuardedFetchError;
  try {
    mainResult = await fetchWithGuard(parsedInput.toString(), mainController.signal);
  } finally {
    clearTimeout(mainTimeout);
  }

  if (isGuardedFetchError(mainResult)) {
    return { error: mainResult.error };
  }

  const { response, redirectChain, finalUrl } = mainResult;
  const finalIsHttps = finalUrl.startsWith("https://");

  // Characterize the *other* protocol with a lightweight, single-hop probe so httpAvailable/
  // httpsAvailable/httpRedirectsToHttps are always populated regardless of which protocol the user typed.
  const probeController = new AbortController();
  const probeTimeout = setTimeout(() => probeController.abort(), PROBE_TIMEOUT_MS);

  const httpProbeUrl = new URL(parsedInput);
  httpProbeUrl.protocol = "http:";
  const httpsProbeUrl = new URL(parsedInput);
  httpsProbeUrl.protocol = "https:";

  let httpProbe: Awaited<ReturnType<typeof probeAvailability>>;
  let httpsProbe: Awaited<ReturnType<typeof probeAvailability>>;
  try {
    [httpProbe, httpsProbe] = await Promise.all([
      probeAvailability(httpProbeUrl.toString(), probeController.signal),
      probeAvailability(httpsProbeUrl.toString(), probeController.signal),
    ]);
  } finally {
    clearTimeout(probeTimeout);
  }

  const httpsInfo: HttpsInfo = {
    httpAvailable: httpProbe.available,
    httpsAvailable: httpsProbe.available || finalIsHttps,
    finalUrl,
    finalStatus: response.status,
    redirectChain,
    httpRedirectsToHttps: Boolean(httpProbe.redirectsTo && new URL(httpProbe.redirectsTo, httpProbeUrl).protocol === "https:"),
    certificateInspectionAvailable: false,
  };

  const setCookieValues: string[] =
    typeof (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === "function"
      ? (response.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : [];
  const cookies = parseCookies(setCookieValues);

  const html = await readHtmlBody(response);
  const cspFrameAncestors = (() => {
    const csp = response.headers.get("content-security-policy");
    return csp ? getCspFrameAncestors(csp) : null;
  })();

  const cspResult = getCspHeaderFinding(response.headers);

  const findings: Finding[] = [
    ...analyzeHttps(httpsInfo),
    ...analyzeHsts(response.headers, finalIsHttps),
    analyzeXContentTypeOptions(response.headers),
    analyzeClickjacking(response.headers, cspFrameAncestors),
    analyzeReferrerPolicy(response.headers),
    analyzePermissionsPolicy(response.headers),
    ...analyzeCrossOriginIsolationHeaders(response.headers),
    analyzeCacheControl(response.headers),
    ...analyzeCors(response.headers),
    ...analyzeInformationDisclosure(response.headers),
    ...analyzeCookies(cookies, finalIsHttps),
  ];

  const clearSiteData = analyzeClearSiteData(response.headers);
  if (clearSiteData) findings.push(clearSiteData);

  if (cspResult.finding) {
    findings.push(cspResult.finding);
  }
  if (cspResult.value) {
    findings.push(...analyzeCsp(cspResult.value));
  }

  if (html) {
    findings.push(...analyzeMixedContentAndHtml(html, finalIsHttps, finalUrl));
  }

  const categories = scoreCategories(findings);
  const score = computeOverallScore(categories);

  return {
    url: rawUrl,
    timestamp: new Date().toISOString(),
    score,
    rating: scoreToRating(score),
    summary: summarizeFindings(findings),
    categories,
    https: httpsInfo,
    cookies,
    findings,
  };
}
