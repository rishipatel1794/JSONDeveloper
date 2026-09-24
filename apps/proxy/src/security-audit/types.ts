export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "PASS";

export type FindingCategory =
  | "Security Headers"
  | "HTTPS"
  | "Cookies"
  | "Content Security"
  | "CORS"
  | "Information Disclosure"
  | "Mixed Content";

/** A ready-to-paste config snippet for one platform, shown alongside a finding where relevant. */
export interface FixExample {
  platform: "Express.js" | "Laravel" | "Nginx" | "Apache" | "Cloudflare Workers" | "Cloudflare Pages";
  code: string;
}

export interface Finding {
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  description: string;
  impact: string;
  recommendation: string;
  evidence: Record<string, unknown>;
  references?: string[];
  fixes?: FixExample[];
}

export interface CategoryScore {
  score: number;
  findingIds: string[];
}

export interface AuditSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  passed: number;
}

export interface RedirectHop {
  url: string;
  status: number;
}

export interface HttpsInfo {
  httpAvailable: boolean;
  httpsAvailable: boolean;
  finalUrl: string;
  finalStatus: number;
  redirectChain: RedirectHop[];
  httpRedirectsToHttps: boolean;
  /**
   * Cloudflare Workers' fetch() does not expose the underlying TLS socket (no equivalent to Node's
   * tls.getPeerCertificate()), so certificate subject/issuer/expiry are never fabricated — this stays
   * false rather than guessing, per the "do not fake data the runtime can't see" requirement.
   */
  certificateInspectionAvailable: false;
}

export interface CookieFinding {
  name: string;
  /** Value is never included — cookie values are masked before this ever leaves the analyzer. */
  maskedValue: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "Strict" | "Lax" | "None" | null;
  domain: string | null;
  path: string | null;
  maxAge: number | null;
  expires: string | null;
  hasSecurePrefix: boolean;
  hasHostPrefix: boolean;
}

export interface AuditReport {
  url: string;
  timestamp: string;
  score: number;
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  summary: AuditSummary;
  categories: Record<FindingCategory, CategoryScore>;
  https: HttpsInfo;
  cookies: CookieFinding[];
  findings: Finding[];
}

export interface AuditError {
  error: string;
}
