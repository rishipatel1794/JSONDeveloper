"use client";

import { useMemo, useState } from "react";
import { Inbox, Sparkles } from "lucide-react";

import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { TabList, TabPanel } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { downloadTextFile } from "@/lib/download";
import type { ApiResponse } from "@/lib/api-client/types";
import { isJsonContentType, looksLikeJson } from "@/lib/api-client/utils";
import { formatJson } from "@/lib/tools/json/formatter";

import { ResponseBody } from "./ResponseBody";
import { ResponseHeaders } from "./ResponseHeaders";
import { ResponseStatus } from "./ResponseStatus";

type ResponseTab = "pretty" | "raw" | "headers";

interface ResponseViewerProps {
	response: ApiResponse;
	onExtractVariable?: () => void;
}

export function ResponseViewer({ response, onExtractVariable }: ResponseViewerProps) {
	const [tab, setTab] = useState<ResponseTab>("pretty");

	const isJson = isJsonContentType(response.contentType) || looksLikeJson(response.body);
	const isHtml = /text\/html/i.test(response.contentType);

	const prettyBody = useMemo(() => {
		if (!isJson) return response.body;
		const formatted = formatJson(response.body);
		return formatted.success && formatted.data ? formatted.data : response.body;
	}, [isJson, response.body]);

	const language = isJson ? "json" : isHtml ? "html" : "plaintext";
	const displayedBody = tab === "raw" ? response.body : prettyBody;
	const filename = isJson ? "response.json" : "response.txt";

	function handleDownload() {
		downloadTextFile(displayedBody, filename, isJson ? "application/json" : "text/plain");
	}

	return (
		<ToolPanel
			title="Response"
			icon={Inbox}
			action={
				tab !== "headers" ? (
					<div className="flex items-center gap-2">
						<CopyButton value={displayedBody} label="Copy" disabled={!displayedBody} />
						<Button onClick={handleDownload} variant="outline" size="sm" disabled={!displayedBody}>
							Download
						</Button>
						{onExtractVariable && response.body && (
							<Button onClick={onExtractVariable} variant="outline" size="sm">
								<Sparkles className="size-3.5" />
								Extract Variable
							</Button>
						)}
					</div>
				) : undefined
			}
		>
			<div className="p-4">
				<ResponseStatus status={response.status} statusText={response.statusText} duration={response.duration} size={response.size} />

				{response.error && <p className="mt-2 text-sm text-destructive">{response.error}</p>}

				<div className="mt-4">
					<TabList
						aria-label="Response view"
						value={tab}
						onChange={next => setTab(next as ResponseTab)}
						items={[
							{ value: "pretty", label: "Pretty" },
							{ value: "raw", label: "Raw" },
							{ value: "headers", label: "Headers" },
						]}
					/>

					<div className="pt-4">
						<TabPanel value="pretty" activeValue={tab}>
							<ResponseBody value={prettyBody} language={language} />
						</TabPanel>

						<TabPanel value="raw" activeValue={tab}>
							<ResponseBody value={response.body} language={language} />
						</TabPanel>

						<TabPanel value="headers" activeValue={tab}>
							<ResponseHeaders headers={response.headers} />
						</TabPanel>
					</div>
				</div>
			</div>
		</ToolPanel>
	);
}
