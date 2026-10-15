"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { JwtHeader, JwtPayload } from "@/lib/tools/jwt/types";
import { DEFAULT_HEADER, DEFAULT_PAYLOAD } from "@/lib/tools/jwt-generator/defaults";
import { generateJwt } from "@/lib/tools/jwt-generator/sign";
import type { JwtAlgorithm } from "@/lib/tools/jwt-generator/types";

import { JwtGeneratorHeaderPanel } from "./JwtGeneratorHeaderPanel";
import { JwtGeneratorOutput } from "./JwtGeneratorOutput";
import { JwtGeneratorPayloadPanel } from "./JwtGeneratorPayloadPanel";
import { JwtGeneratorPrivacyNotice } from "./JwtGeneratorPrivacyNotice";
import { JwtGeneratorSigningPanel } from "./JwtGeneratorSigningPanel";

const DEFAULT_HEADER_JSON = JSON.stringify(DEFAULT_HEADER, null, 2);
const DEFAULT_PAYLOAD_JSON = JSON.stringify(DEFAULT_PAYLOAD, null, 2);

function parseJsonObject(input: string): { value: Record<string, unknown> } | { error: string } {
	let parsed: unknown;
	try {
		parsed = JSON.parse(input);
	} catch (error) {
		return { error: error instanceof Error ? error.message : "Invalid JSON." };
	}

	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
		return { error: "Must be a JSON object." };
	}

	return { value: parsed as Record<string, unknown> };
}

function snapshotOf(headerInput: string, payloadInput: string, algorithm: string, secret: string, privateKeyPem: string): string {
	return JSON.stringify({ headerInput, payloadInput, algorithm, secret, privateKeyPem });
}

export function JwtGenerator() {
	const [headerInput, setHeaderInput] = useState(DEFAULT_HEADER_JSON);
	const [payloadInput, setPayloadInput] = useState(DEFAULT_PAYLOAD_JSON);
	const [algorithm, setAlgorithm] = useState<JwtAlgorithm>("HS256");
	const [secret, setSecret] = useState("");
	const [privateKeyPem, setPrivateKeyPem] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generateError, setGenerateError] = useState<string | null>(null);
	const [output, setOutput] = useState<{ token: string; header: JwtHeader; payload: JwtPayload; algorithm: string; warnings: string[] } | null>(null);
	const [generatedSnapshot, setGeneratedSnapshot] = useState<string | null>(null);

	const headerParsed = useMemo(() => parseJsonObject(headerInput), [headerInput]);
	const payloadParsed = useMemo(() => parseJsonObject(payloadInput), [payloadInput]);

	const headerError = "error" in headerParsed ? `Invalid header JSON: ${headerParsed.error}` : null;
	const payloadError = "error" in payloadParsed ? `Invalid payload JSON: ${payloadParsed.error}` : null;

	const currentSnapshot = snapshotOf(headerInput, payloadInput, algorithm, secret, privateKeyPem);
	const stale = output !== null && generatedSnapshot !== currentSnapshot;

	function handleApplyClaim(claim: string, value: unknown) {
		if (!("value" in payloadParsed)) return;
		const next = { ...payloadParsed.value };
		if (value === "" || value === undefined) {
			delete next[claim];
		} else {
			next[claim] = value;
		}
		setPayloadInput(JSON.stringify(next, null, 2));
	}

	async function handleGenerate() {
		setGenerateError(null);

		if ("error" in headerParsed) {
			setGenerateError(headerError);
			return;
		}
		if ("error" in payloadParsed) {
			setGenerateError(payloadError);
			return;
		}

		setIsGenerating(true);
		try {
			const result = await generateJwt({
				header: headerParsed.value as JwtHeader,
				payload: payloadParsed.value as JwtPayload,
				algorithm,
				secret,
				privateKeyPem,
			});

			if (!result.success || !result.token) {
				setGenerateError(result.error ?? "Unable to generate a token.");
				setOutput(null);
				return;
			}

			setOutput({
				token: result.token,
				header: { ...(headerParsed.value as JwtHeader), alg: algorithm },
				payload: payloadParsed.value as JwtPayload,
				algorithm,
				warnings: result.warnings ?? [],
			});
			setGeneratedSnapshot(currentSnapshot);
		} finally {
			setIsGenerating(false);
		}
	}

	function handleClearAll() {
		setHeaderInput(DEFAULT_HEADER_JSON);
		setPayloadInput(DEFAULT_PAYLOAD_JSON);
		setAlgorithm("HS256");
		setSecret("");
		setPrivateKeyPem("");
		setOutput(null);
		setGeneratedSnapshot(null);
		setGenerateError(null);
	}

	function handleClearSigningOnly() {
		setSecret("");
		setPrivateKeyPem("");
	}

	return (
		<div className="space-y-4">
			<JwtGeneratorPrivacyNotice />

			<div className="grid gap-4 lg:grid-cols-2">
				<JwtGeneratorHeaderPanel value={headerInput} onChange={setHeaderInput} error={headerError} />
				<JwtGeneratorPayloadPanel value={payloadInput} onChange={setPayloadInput} error={payloadError} onApplyClaim={handleApplyClaim} />
			</div>

			<JwtGeneratorSigningPanel
				algorithm={algorithm}
				onAlgorithmChange={setAlgorithm}
				secret={secret}
				onSecretChange={setSecret}
				privateKeyPem={privateKeyPem}
				onPrivateKeyChange={setPrivateKeyPem}
				onClearAll={handleClearSigningOnly}
			/>

			<div className="flex flex-wrap items-center gap-2">
				<Button onClick={handleGenerate} variant="primary" size="sm" disabled={isGenerating}>
					<Sparkles className="size-3.5" />
					{isGenerating ? "Generating…" : "Generate Token"}
				</Button>
				<Button onClick={handleClearAll} variant="ghost" size="sm" className="text-destructive hover:bg-destructive-muted">
					<RotateCcw className="size-3.5" />
					Clear All
				</Button>
			</div>

			{generateError && (
				<div className="rounded-lg border border-destructive-border bg-destructive-muted p-4 text-sm text-destructive-muted-foreground" role="alert">
					{generateError}
				</div>
			)}

			{output && (
				<JwtGeneratorOutput
					token={output.token}
					header={output.header}
					payload={output.payload}
					algorithm={output.algorithm}
					warnings={output.warnings}
					stale={stale}
				/>
			)}
		</div>
	);
}
