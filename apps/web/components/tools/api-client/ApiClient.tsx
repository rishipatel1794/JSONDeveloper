"use client";

import { useRef, useState } from "react";
import { Circle, Copy, Loader2, Pencil, Save, Send, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { TabPanel } from "@/components/ui/Tabs";
import { sendApiRequest } from "@/lib/api-client/client";
import { apiRequestToCurlCommand } from "@/lib/api-client/export/curl-exporter";
import type { ApiBodyType, ApiRequestConfig, ApiResponse } from "@/lib/api-client/types";
import { API_EXAMPLES, validateRequestUrl } from "@/lib/api-client/utils";
import { resolveRequestVariables, resolveString } from "@/lib/api-client/variables/resolver";
import type { ResolvedVariable } from "@/lib/api-client/variables/types";
import type { VariableExtractionRule } from "@/lib/api-client/workspace/types";
import { createKeyValuePair } from "@/lib/tools/shared/http";

import { ApiExamples } from "./ApiExamples";
import { ApiPrivacyNotice } from "./ApiPrivacyNotice";
import { Authorization } from "./Authorization";
import { HeadersEditor } from "./HeadersEditor";
import { MethodSelector } from "./MethodSelector";
import { QueryParams } from "./QueryParams";
import { RequestBody } from "./RequestBody";
import { RequestSummary } from "./RequestSummary";
import { RequestTabs, type RequestTabValue } from "./RequestTabs";
import { ResponseViewer } from "./ResponseViewer";
import { VariableAwareUrlInput } from "./VariableAwareUrlInput";
import { TokenDetectionBanner } from "./workspace/TokenDetectionBanner";

interface ApiClientProps {
	request: ApiRequestConfig;
	onRequestChange: (request: ApiRequestConfig) => void;
	variableMap: Map<string, ResolvedVariable>;
	requestLabel: string;
	isSavedRequest: boolean;
	isDirty: boolean;
	onSave: () => void;
	onDuplicate?: () => void;
	onRename?: () => void;
	onDelete?: () => void;
	onExtractVariable: (responseBody: string) => void;
	onUseAsBearerToken: (path: string, responseBody: string) => void;
	savedExtractionRules?: VariableExtractionRule[];
	autoExtract?: boolean;
	onRunAutoExtraction?: (rules: VariableExtractionRule[], responseBody: string) => Promise<string[]>;
	onUpdateVariable: (variable: ResolvedVariable, newValue: string) => void;
	onCreateGlobalVariable: (name: string) => void;
}

export function ApiClient({
	request,
	onRequestChange,
	variableMap,
	requestLabel,
	isSavedRequest,
	isDirty,
	onSave,
	onDuplicate,
	onRename,
	onDelete,
	onExtractVariable,
	onUseAsBearerToken,
	savedExtractionRules,
	autoExtract,
	onRunAutoExtraction,
	onUpdateVariable,
	onCreateGlobalVariable,
}: ApiClientProps) {
	const [activeTab, setActiveTab] = useState<RequestTabValue>("params");
	const [urlError, setUrlError] = useState<string>();
	const [sendError, setSendError] = useState("");
	const [response, setResponse] = useState<ApiResponse | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [autoExtractMessage, setAutoExtractMessage] = useState("");

	const abortControllerRef = useRef<AbortController | null>(null);

	function handleBodyTypeChange(type: ApiBodyType) {
		const hasContentType = request.headers.some(header => header.key.toLowerCase() === "content-type");
		let headers = request.headers;

		if (!hasContentType) {
			if (type === "json") headers = [...request.headers, createKeyValuePair("Content-Type", "application/json")];
			else if (type === "form-urlencoded") {
				headers = [...request.headers, createKeyValuePair("Content-Type", "application/x-www-form-urlencoded")];
			}
		}

		onRequestChange({ ...request, bodyType: type, headers });
	}

	async function handleSend() {
		if (isSending) return;

		const resolved = resolveRequestVariables(request, variableMap);

		if (resolved.missing.length > 0) {
			const first = resolved.missing[0];
			setSendError(`Variable "${first}" is not defined. Select an environment or define the variable before sending.`);
			return;
		}

		const validationError = validateRequestUrl(resolved.request.url);
		if (validationError) {
			setUrlError(validationError);
			return;
		}

		setUrlError(undefined);
		setSendError("");
		setAutoExtractMessage("");
		setIsSending(true);
		setResponse(null);

		const controller = new AbortController();
		abortControllerRef.current = controller;

		try {
			const result = await sendApiRequest(resolved.request, controller.signal);
			setResponse(result);

			if (result.success && isSavedRequest && autoExtract && savedExtractionRules?.length && onRunAutoExtraction) {
				const updated = await onRunAutoExtraction(savedExtractionRules, result.body);
				if (updated.length > 0) setAutoExtractMessage(`✓ ${updated.join(" updated, ")} updated`);
			}
		} catch (error) {
			if (!(error instanceof DOMException && error.name === "AbortError")) {
				setResponse({
					success: false,
					status: 0,
					statusText: "",
					headers: {},
					body: "",
					contentType: "",
					size: 0,
					duration: 0,
					error: "Unable to reach the API proxy.",
				});
			}
		} finally {
			setIsSending(false);
			abortControllerRef.current = null;
		}
	}

	function handleCancel() {
		abortControllerRef.current?.abort();
	}

	function handleLoadExample(index: number) {
		const example = API_EXAMPLES[index];
		if (!example) return;

		onRequestChange(example.request);
		setResponse(null);
		setUrlError(undefined);
		setSendError("");
		setActiveTab("params");
	}

	const enabledParamCount = request.queryParams.filter(param => param.enabled).length;
	const enabledHeaderCount = request.headers.filter(header => header.enabled).length;

	const urlPreview = resolveString(request.url, variableMap);
	const showUrlPreview = request.url.includes("{{") && urlPreview.value !== request.url;

	const curlCommand = apiRequestToCurlCommand(resolveRequestVariables(request, variableMap).request);

	return (
		<div className="space-y-4">
			<ApiPrivacyNotice />

			<div className="flex flex-wrap items-center gap-2">
				<h1 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
					<span className="truncate">{requestLabel}</span>
					{isDirty && (
						<span className="inline-flex shrink-0 items-center gap-1 text-xs font-normal text-warning">
							<Circle className="size-1.5 fill-current" />
							Unsaved changes
						</span>
					)}
				</h1>

				<div className="ml-auto flex items-center gap-1.5">
					<CopyButton value={curlCommand} label="Copy as cURL" ariaLabel="Copy request as cURL command" />
					<Button onClick={onSave} variant={isDirty || !isSavedRequest ? "primary" : "outline"} size="sm">
						<Save className="size-3.5" />
						Save
					</Button>
					{isSavedRequest && (
						<>
							<Button onClick={onRename} variant="ghost" size="sm">
								<Pencil className="size-3.5" />
							</Button>
							<Button onClick={onDuplicate} variant="ghost" size="sm">
								<Copy className="size-3.5" />
							</Button>
							<Button onClick={onDelete} variant="ghost" size="sm" className="text-destructive hover:bg-destructive-muted">
								<Trash2 className="size-3.5" />
							</Button>
						</>
					)}
				</div>
			</div>

			<div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
				<div className="flex flex-wrap items-start gap-2">
					<MethodSelector value={request.method} onChange={method => onRequestChange({ ...request, method })} />

					<div className="min-w-0 flex-1">
						<VariableAwareUrlInput
							value={request.url}
							onChange={url => onRequestChange({ ...request, url })}
							error={urlError}
							variableMap={variableMap}
							onUpdateVariable={onUpdateVariable}
							onCreateGlobalVariable={onCreateGlobalVariable}
						/>
						{showUrlPreview && (
							<p className="mt-1 truncate font-mono text-xs text-muted-foreground">
								Resolved: <span className={urlPreview.missing.length > 0 ? "text-destructive" : "text-success"}>{urlPreview.value}</span>
							</p>
						)}
					</div>

					{isSending ? (
						<Button onClick={handleCancel} variant="outline" size="md" className="h-11">
							<X className="size-4" />
							Cancel
						</Button>
					) : (
						<Button onClick={handleSend} size="md" className="h-11">
							<Send className="size-4" />
							Send
						</Button>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<ApiExamples onSelect={handleLoadExample} />
				</div>

				<div>
					<RequestTabs value={activeTab} onChange={setActiveTab} paramCount={enabledParamCount} headerCount={enabledHeaderCount} />

					<div className="pt-4">
						<TabPanel value="params" activeValue={activeTab}>
							<QueryParams items={request.queryParams} onChange={queryParams => onRequestChange({ ...request, queryParams })} />
						</TabPanel>

						<TabPanel value="auth" activeValue={activeTab}>
							<Authorization auth={request.auth} onChange={auth => onRequestChange({ ...request, auth })} />
						</TabPanel>

						<TabPanel value="headers" activeValue={activeTab}>
							<HeadersEditor items={request.headers} onChange={headers => onRequestChange({ ...request, headers })} />
						</TabPanel>

						<TabPanel value="body" activeValue={activeTab}>
							<RequestBody
								bodyType={request.bodyType}
								onBodyTypeChange={handleBodyTypeChange}
								body={request.body}
								onBodyChange={body => onRequestChange({ ...request, body })}
								formData={request.formData}
								onFormDataChange={formData => onRequestChange({ ...request, formData })}
							/>
						</TabPanel>
					</div>
				</div>
			</div>

			<div aria-live="polite" className="space-y-2 text-sm text-muted-foreground">
				{isSending && (
					<span className="inline-flex items-center gap-2">
						<Loader2 className="size-4 animate-spin" />
						Sending request…
					</span>
				)}
				{sendError && <p className="text-destructive">{sendError}</p>}
				{autoExtractMessage && (
					<p className="flex items-center gap-1.5 text-success">
						<Sparkles className="size-3.5" />
						{autoExtractMessage}
					</p>
				)}
			</div>

			{response && (
				<TokenDetectionBanner
					responseBody={response.body}
					onUseAsBearerToken={path => onUseAsBearerToken(path, response.body)}
					onExtractAll={() => onExtractVariable(response.body)}
				/>
			)}

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">{response && <ResponseViewer response={response} onExtractVariable={() => onExtractVariable(response.body)} />}</div>
				<RequestSummary request={request} />
			</div>
		</div>
	);
}
