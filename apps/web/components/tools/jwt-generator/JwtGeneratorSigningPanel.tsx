"use client";

import { useEffect, useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { detectEdDsaSupport } from "@/lib/tools/jwt-generator/capabilities";
import { ASYMMETRIC_ALGORITHMS, isSymmetricAlgorithm, SYMMETRIC_ALGORITHMS, type JwtAlgorithm } from "@/lib/tools/jwt-generator/types";

interface JwtGeneratorSigningPanelProps {
	algorithm: JwtAlgorithm;
	onAlgorithmChange: (algorithm: JwtAlgorithm) => void;
	secret: string;
	onSecretChange: (value: string) => void;
	privateKeyPem: string;
	onPrivateKeyChange: (value: string) => void;
	onClearAll: () => void;
}

const inputClass =
	"w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function JwtGeneratorSigningPanel({
	algorithm,
	onAlgorithmChange,
	secret,
	onSecretChange,
	privateKeyPem,
	onPrivateKeyChange,
	onClearAll,
}: JwtGeneratorSigningPanelProps) {
	const [eddsaSupported, setEddsaSupported] = useState<boolean | null>(null);

	useEffect(() => {
		detectEdDsaSupport().then(setEddsaSupported);
	}, []);

	const symmetric = isSymmetricAlgorithm(algorithm);

	return (
		<ToolPanel title="Signing" icon={KeyRound}>
			<div className="space-y-3 p-3">
				<div>
					<label className="mb-1 block text-xs font-medium text-muted-foreground">Algorithm</label>
					<select value={algorithm} onChange={event => onAlgorithmChange(event.target.value as JwtAlgorithm)} className={inputClass}>
						<optgroup label="Symmetric (shared secret)">
							{SYMMETRIC_ALGORITHMS.map(alg => (
								<option key={alg} value={alg}>
									{alg}
								</option>
							))}
						</optgroup>
						<optgroup label="Asymmetric (private key)">
							{ASYMMETRIC_ALGORITHMS.map(alg => (
								<option key={alg} value={alg} disabled={alg === "EdDSA" && eddsaSupported === false}>
									{alg}
									{alg === "EdDSA" && eddsaSupported === false ? " (unsupported in this browser)" : ""}
								</option>
							))}
						</optgroup>
					</select>
					{algorithm === "EdDSA" && eddsaSupported === false && (
						<p className="mt-1 text-xs text-warning">
							This browser&apos;s Web Crypto implementation doesn&apos;t support Ed25519 yet. Choose a different browser or algorithm.
						</p>
					)}
				</div>

				{symmetric ? (
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">Signing secret</label>
						<input
							type="password"
							value={secret}
							onChange={event => onSecretChange(event.target.value)}
							placeholder="Enter a secret key"
							autoComplete="off"
							className={inputClass}
						/>
						<p className="mt-1 text-xs text-subtle-foreground">Used only in your browser to compute the signature. Never sent anywhere.</p>
					</div>
				) : (
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">Private key (PKCS8 PEM)</label>
						<textarea
							value={privateKeyPem}
							onChange={event => onPrivateKeyChange(event.target.value)}
							placeholder={"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"}
							rows={6}
							autoComplete="off"
							spellCheck={false}
							className={`${inputClass} font-mono text-xs`}
						/>
						<p className="mt-1 text-xs text-subtle-foreground">
							Must be PKCS8 PEM format, starting with <code>-----BEGIN PRIVATE KEY-----</code>. A PKCS1 key (
							<code>-----BEGIN RSA PRIVATE KEY-----</code>) needs converting first, e.g. with{" "}
							<code>openssl pkcs8 -topk8 -nocrypt</code>. Never sent anywhere.
						</p>
					</div>
				)}

				<Button type="button" variant="ghost" size="sm" onClick={onClearAll} className="text-destructive hover:bg-destructive-muted">
					<Trash2 className="size-3.5" />
					Clear secret / key
				</Button>
			</div>
		</ToolPanel>
	);
}
