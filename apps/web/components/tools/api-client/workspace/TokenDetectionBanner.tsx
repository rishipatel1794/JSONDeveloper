import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { findTokenCandidates } from "@/lib/api-client/variables/extractor";

interface TokenDetectionBannerProps {
	responseBody: string;
	onUseAsBearerToken: (path: string) => void;
	onExtractAll: () => void;
}

export function TokenDetectionBanner({ responseBody, onUseAsBearerToken, onExtractAll }: TokenDetectionBannerProps) {
	const candidates = findTokenCandidates(responseBody);
	if (candidates.length === 0) return null;

	return (
		<div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
			<p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
				<Sparkles className="size-4 text-primary" />
				Detected possible tokens
			</p>

			<ul className="mt-2 space-y-1.5">
				{candidates.map(candidate => (
					<li key={candidate.path} className="flex items-center justify-between gap-2 text-xs">
						<span className="min-w-0 flex-1 truncate font-mono text-muted-foreground">
							{candidate.path}
							{candidate.looksLikeJwt && (
								<span className="ml-1.5 rounded-full border border-primary/30 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary-accent">
									JWT
								</span>
							)}
						</span>
						<Button onClick={() => onUseAsBearerToken(candidate.path)} variant="outline" size="sm">
							Use as Bearer Token
						</Button>
					</li>
				))}
			</ul>

			<Button onClick={onExtractAll} variant="ghost" size="sm" className="mt-2">
				Extract Variables
			</Button>
		</div>
	);
}
