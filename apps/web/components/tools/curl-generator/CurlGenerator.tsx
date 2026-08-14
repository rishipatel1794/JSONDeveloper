"use client";

import { useMemo, useState, type ReactNode } from "react";

import { TabPanel } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { downloadTextFile } from "@/lib/download";
import { generateCurl } from "@/lib/tools/curl/generator";
import { parseCurl } from "@/lib/tools/curl/parser";
import type { BodyType, CurlRequest, Shell } from "@/lib/tools/curl/types";
import { CURL_EXAMPLES, createKeyValuePair, defaultCurlRequest } from "@/lib/tools/curl/utils";
import { cn } from "@/lib/utils";

import { AuthenticationEditor } from "./AuthenticationEditor";
import { CurlExamples } from "./CurlExamples";
import { CurlOptions } from "./CurlOptions";
import { CurlOutput } from "./CurlOutput";
import { CurlPrivacyNotice } from "./CurlPrivacyNotice";
import { HeadersEditor } from "./HeadersEditor";
import { ImportCurlDialog } from "./ImportCurlDialog";
import { QueryParamsEditor } from "./QueryParamsEditor";
import { RequestBodyEditor } from "./RequestBodyEditor";
import { RequestMethodSelector } from "./RequestMethodSelector";
import { RequestSummary } from "./RequestSummary";
import { RequestTabs, type RequestTabValue } from "./RequestTabs";
import { UrlInput } from "./UrlInput";

type Mode = "build" | "import";

export function CurlGenerator() {
	const [mode, setMode] = useState<Mode>("build");
	const [request, setRequest] = useState<CurlRequest>(defaultCurlRequest);
	const [activeTab, setActiveTab] = useState<RequestTabValue>("query");
	const [shell, setShell] = useState<Shell>("bash");

	// Regenerating is a cheap, pure string build (no parsing), so a live preview stays responsive
	// without needing a "Generate" button or a debounce.
	const command = useMemo(() => generateCurl(request, shell), [request, shell]);

	function handleBodyTypeChange(type: BodyType) {
		setRequest(prev => {
			const hasContentType = prev.headers.some(header => header.key.toLowerCase() === "content-type");
			const headers =
				type === "json" && !hasContentType ? [...prev.headers, createKeyValuePair("Content-Type", "application/json")] : prev.headers;

			return { ...prev, bodyType: type, headers };
		});
	}

	function handleReset() {
		setRequest(defaultCurlRequest());
		setActiveTab("query");
	}

	function handleDownload() {
		if (!command) return;

		if (shell === "bash") {
			downloadTextFile(`#!/bin/bash\n\n${command}\n`, "request.sh", "text/x-sh");
		} else {
			downloadTextFile(`${command}\n`, "request.ps1", "text/plain");
		}
	}

	function handleLoadExample(index: number) {
		const example = CURL_EXAMPLES[index];
		if (!example) return;

		setRequest(example.request);
		setActiveTab("query");
	}

	function handleImport(rawCommand: string): string | undefined {
		const result = parseCurl(rawCommand);

		if (!result.success || !result.data) {
			return result.error ?? "Unable to parse this cURL command.";
		}

		setRequest(result.data);
		setMode("build");
		setActiveTab("query");
		return undefined;
	}

	const enabledQueryCount = request.queryParams.filter(param => param.enabled).length;
	const enabledHeaderCount = request.headers.filter(header => header.enabled).length;

	return (
		<div className="space-y-4">
			<CurlPrivacyNotice />

			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="inline-flex rounded-md border border-border bg-card p-1">
					<ModeButton active={mode === "build"} onClick={() => setMode("build")}>
						Build Request
					</ModeButton>
					<ModeButton active={mode === "import"} onClick={() => setMode("import")}>
						Import cURL
					</ModeButton>
				</div>

				{mode === "build" && (
					<div className="flex items-center gap-2">
						<CurlExamples onSelect={handleLoadExample} />
						<Button onClick={handleReset} variant="ghost" className="text-destructive hover:bg-destructive-muted">
							Reset
						</Button>
					</div>
				)}
			</div>

			{mode === "import" ? (
				<ImportCurlDialog onImport={handleImport} />
			) : (
				<div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
					<div className="flex flex-wrap gap-2">
						<RequestMethodSelector value={request.method} onChange={method => setRequest(prev => ({ ...prev, method }))} />
						<UrlInput value={request.url} onChange={url => setRequest(prev => ({ ...prev, url }))} />
					</div>

					<div>
						<RequestTabs value={activeTab} onChange={setActiveTab} queryCount={enabledQueryCount} headerCount={enabledHeaderCount} />

						<div className="pt-4">
							<TabPanel value="query" activeValue={activeTab}>
								<QueryParamsEditor
									items={request.queryParams}
									onChange={queryParams => setRequest(prev => ({ ...prev, queryParams }))}
								/>
							</TabPanel>

							<TabPanel value="headers" activeValue={activeTab}>
								<HeadersEditor items={request.headers} onChange={headers => setRequest(prev => ({ ...prev, headers }))} />
							</TabPanel>

							<TabPanel value="body" activeValue={activeTab}>
								<RequestBodyEditor
									bodyType={request.bodyType}
									onBodyTypeChange={handleBodyTypeChange}
									body={request.body}
									onBodyChange={body => setRequest(prev => ({ ...prev, body }))}
									formData={request.formData}
									onFormDataChange={formData => setRequest(prev => ({ ...prev, formData }))}
								/>
							</TabPanel>

							<TabPanel value="auth" activeValue={activeTab}>
								<AuthenticationEditor auth={request.auth} onChange={auth => setRequest(prev => ({ ...prev, auth }))} />
							</TabPanel>
						</div>
					</div>

					<CurlOptions
						followRedirects={request.followRedirects}
						onFollowRedirectsChange={followRedirects => setRequest(prev => ({ ...prev, followRedirects }))}
						compressed={request.compressed}
						onCompressedChange={compressed => setRequest(prev => ({ ...prev, compressed }))}
						insecure={request.insecure}
						onInsecureChange={insecure => setRequest(prev => ({ ...prev, insecure }))}
						cookies={request.cookies}
						onCookiesChange={cookies => setRequest(prev => ({ ...prev, cookies }))}
						userAgent={request.userAgent}
						onUserAgentChange={userAgent => setRequest(prev => ({ ...prev, userAgent }))}
					/>
				</div>
			)}

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<CurlOutput command={command} shell={shell} onShellChange={setShell} onDownload={handleDownload} />
				</div>

				<RequestSummary request={request} />
			</div>
		</div>
	);
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"rounded px-3 py-1.5 text-sm font-medium transition-colors",
				active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
			)}
		>
			{children}
		</button>
	);
}
