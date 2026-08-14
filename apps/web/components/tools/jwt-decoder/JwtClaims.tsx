import { ListChecks } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { STANDARD_CLAIMS, type JwtPayload } from "@/lib/tools/jwt/types";
import { formatClaimValue, formatTimestamp } from "@/lib/tools/jwt/utils";

const CLAIM_LABELS: Record<string, string> = {
	iss: "Issuer",
	sub: "Subject",
	aud: "Audience",
	exp: "Expires At",
	nbf: "Not Before",
	iat: "Issued At",
	jti: "JWT ID",
};

const TIMESTAMP_CLAIMS = new Set(["exp", "nbf", "iat"]);

interface JwtClaimsProps {
	payload: JwtPayload;
}

export function JwtClaims({ payload }: JwtClaimsProps) {
	const presentClaims = STANDARD_CLAIMS.filter(claim => payload[claim] !== undefined);

	return (
		<ToolPanel title="Claims" icon={ListChecks}>
			{presentClaims.length === 0 ? (
				<p className="p-4 text-sm text-muted-foreground">No standard claims found in this payload.</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<caption className="sr-only">Standard JWT claims found in the payload</caption>
						<thead>
							<tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-subtle-foreground">
								<th scope="col" className="px-4 py-2 font-medium">
									Claim
								</th>
								<th scope="col" className="px-4 py-2 font-medium">
									Value
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border-subtle">
							{presentClaims.map(claim => {
								const rawValue = payload[claim];
								const isTimestamp = TIMESTAMP_CLAIMS.has(claim) && typeof rawValue === "number";

								return (
									<tr key={claim}>
										<th scope="row" className="whitespace-nowrap px-4 py-2.5 text-left font-mono text-xs font-medium text-primary-accent">
											{claim}
											<span className="ml-1.5 font-sans font-normal text-subtle-foreground">{CLAIM_LABELS[claim]}</span>
										</th>
										<td className="px-4 py-2.5 text-foreground">
											{isTimestamp ? (
												<>
													{formatTimestamp(rawValue as number)}
													<span className="ml-1.5 text-xs text-subtle-foreground">({rawValue as number})</span>
												</>
											) : (
												formatClaimValue(rawValue)
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</ToolPanel>
	);
}
