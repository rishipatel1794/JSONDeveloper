import { ShieldAlert } from "lucide-react";

import { createToolMetadata, getFaqJsonLd, getToolJsonLd } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/shared/RelatedTools";
import { ToolPageContainer } from "@/components/tools/shared/ToolPageContainer";
import { ToolPageHeader } from "@/components/tools/shared/ToolPageHeader";
import { FAQ_ITEMS, SecurityAuditFaq } from "@/components/tools/security-audit/SecurityAuditFaq";
import { SecurityAudit } from "@/components/tools/security-audit/SecurityAudit";
import { SecurityAuditSeoContent } from "@/components/tools/security-audit/SecurityAuditSeoContent";

const TITLE = "Website Security Audit Tool - Free Security Checker | JSONDeveloper";
const DESCRIPTION =
	"Free website security audit tool to check HTTPS, security headers, cookies, CSP, CORS, mixed content and common security configuration issues.";

export const metadata = createToolMetadata({
	title: TITLE,
	description: DESCRIPTION,
	path: "/security-audit",
	keywords: ["website security audit", "security header checker", "https checker", "csp checker", "security scanner"],
});

const jsonLd = getToolJsonLd({ name: "Website Security Audit", description: DESCRIPTION, path: "/security-audit" });
const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

export default function SecurityAuditPage() {
	return (
		<main>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

			<ToolPageContainer wide>
				<ToolPageHeader
					icon={ShieldAlert}
					title="Website Security Audit"
					description="Analyze your website's security headers, HTTPS configuration, cookies, content security, and common security misconfigurations."
				/>

				<SecurityAudit />
			</ToolPageContainer>

			<SecurityAuditSeoContent />
			<SecurityAuditFaq />
			<RelatedTools
				tools={[
					{ name: "API Client", href: "/api-client", description: "Send and inspect HTTP API requests directly from your browser." },
					{ name: "cURL Generator", href: "/curl-generator", description: "Build and generate cURL commands for HTTP requests." },
					{ name: "JWT Decoder", href: "/jwt-decoder", description: "Decode and inspect JSON Web Tokens locally." },
				]}
			/>
		</main>
	);
}
