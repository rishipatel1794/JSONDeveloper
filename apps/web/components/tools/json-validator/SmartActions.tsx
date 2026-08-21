"use client";

import { useState } from "react";
import { ExternalLink, KeyRound, Link2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { SmartDetection } from "@/lib/tools/json-validator/smart-detectors";

interface SmartActionsProps {
	detections: SmartDetection[];
}

function decodeBase64Safe(value: string): string | null {
	try {
		return typeof atob === "function" ? atob(value) : Buffer.from(value, "base64").toString("utf8");
	} catch {
		return null;
	}
}

function SmartActionRow({ detection }: { detection: SmartDetection }) {
	const [revealed, setRevealed] = useState<string | null>(null);

	return (
		<div className="px-4 py-2.5">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate font-mono text-xs text-muted-foreground">{detection.path || "(root)"}</p>
					<p className="truncate font-mono text-sm text-foreground">{detection.value}</p>
				</div>

				{detection.kind === "jwt" && (
					<Button href={`/jwt-decoder?token=${encodeURIComponent(detection.value)}`} variant="outline" size="sm" className="shrink-0">
						<KeyRound className="size-3.5" />
						Decode with JWT Decoder
					</Button>
				)}

				{detection.kind === "url" && (
					<Button href={detection.value} target="_blank" rel="noopener noreferrer" variant="outline" size="sm" className="shrink-0">
						<ExternalLink className="size-3.5" />
						Open URL
					</Button>
				)}

				{detection.kind === "base64" && (
					<Button onClick={() => setRevealed(current => (current === null ? decodeBase64Safe(detection.value) ?? "Unable to decode." : null))} variant="outline" size="sm" className="shrink-0">
						<Link2 className="size-3.5" />
						{revealed === null ? "Decode Base64" : "Hide"}
					</Button>
				)}
			</div>

			{revealed !== null && <p className="mt-1.5 break-all rounded-md bg-secondary px-2.5 py-1.5 font-mono text-xs text-foreground">{revealed}</p>}
		</div>
	);
}

export function SmartActions({ detections }: SmartActionsProps) {
	if (detections.length === 0) return null;

	return (
		<ToolPanel title="Smart Actions" icon={Sparkles}>
			<div className="divide-y divide-border-subtle">
				{detections.map(detection => (
					<SmartActionRow key={`${detection.path}::${detection.kind}`} detection={detection} />
				))}
			</div>
		</ToolPanel>
	);
}
