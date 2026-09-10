"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Settings2, Shield, Trash2, Zap } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { generateHtaccess } from "@/lib/tools/apache/htaccess-generator";
import { DEFAULT_APACHE_CONFIG, type ApacheConfig, type ApacheRedirect } from "@/lib/tools/apache/types";

const inputClasses =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const selectClasses =
	"rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
	return (
		<label className="flex items-center gap-2 text-sm text-foreground">
			<input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="size-4 rounded border-border accent-primary" />
			{label}
		</label>
	);
}

function RedirectRows({ redirects, onChange }: { redirects: ApacheRedirect[]; onChange: (redirects: ApacheRedirect[]) => void }) {
	function update(id: string, patch: Partial<ApacheRedirect>) {
		onChange(redirects.map(redirect => (redirect.id === id ? { ...redirect, ...patch } : redirect)));
	}

	function remove(id: string) {
		onChange(redirects.filter(redirect => redirect.id !== id));
	}

	function add() {
		onChange([...redirects, { id: crypto.randomUUID(), type: "301", from: "", to: "" }]);
	}

	return (
		<div className="space-y-2">
			{redirects.map(redirect => (
				<div key={redirect.id} className="flex items-center gap-2">
					<select
						value={redirect.type}
						onChange={event => update(redirect.id, { type: event.target.value as "301" | "302" })}
						className={selectClasses}
						aria-label="Redirect type"
					>
						<option value="301">301 (permanent)</option>
						<option value="302">302 (temporary)</option>
					</select>
					<input
						value={redirect.from}
						onChange={event => update(redirect.id, { from: event.target.value })}
						placeholder="/old-page"
						aria-label="Redirect from path"
						className={inputClasses}
					/>
					<input
						value={redirect.to}
						onChange={event => update(redirect.id, { to: event.target.value })}
						placeholder="/new-page"
						aria-label="Redirect to path"
						className={inputClasses}
					/>
					<button
						type="button"
						onClick={() => remove(redirect.id)}
						aria-label="Remove redirect"
						className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			))}

			<button
				type="button"
				onClick={add}
				className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
			>
				<Plus className="size-3.5" />
				Add redirect
			</button>
		</div>
	);
}

export function HtaccessGenerator() {
	const [config, setConfig] = useState<ApacheConfig>(DEFAULT_APACHE_CONFIG);

	const output = useMemo(() => generateHtaccess(config), [config]);

	function update<K extends keyof ApacheConfig>(key: K, value: ApacheConfig[K]) {
		setConfig(previous => ({ ...previous, [key]: value }));
	}

	function updateSecurity<K extends keyof ApacheConfig["securityHeaders"]>(key: K, value: ApacheConfig["securityHeaders"][K]) {
		setConfig(previous => ({ ...previous, securityHeaders: { ...previous.securityHeaders, [key]: value } }));
	}

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<div className="space-y-4">
				<ToolPanel title="Basic" icon={Settings2}>
					<div className="space-y-3 p-4">
						<Checkbox checked={config.forceHttps} onChange={value => update("forceHttps", value)} label="Force HTTPS" />
						<Checkbox
							checked={config.disableDirectoryListing}
							onChange={value => update("disableDirectoryListing", value)}
							label="Disable directory listing"
						/>

						<div>
							<label className="block text-xs font-medium text-muted-foreground">www redirect</label>
							<select
								value={config.wwwRedirect}
								onChange={event => update("wwwRedirect", event.target.value as ApacheConfig["wwwRedirect"])}
								className={`mt-1 w-full ${selectClasses}`}
							>
								<option value="none">No redirect</option>
								<option value="www-to-non-www">www → non-www</option>
								<option value="non-www-to-www">non-www → www</option>
							</select>
						</div>

						<div>
							<label className="block text-xs font-medium text-muted-foreground">Default index file(s)</label>
							<input
								value={config.defaultIndexFiles}
								onChange={event => update("defaultIndexFiles", event.target.value)}
								placeholder="index.html index.php"
								className={`mt-1 ${inputClasses}`}
							/>
						</div>

						<div>
							<label className="mb-1.5 block text-xs font-medium text-muted-foreground">Custom redirects</label>
							<RedirectRows redirects={config.redirects} onChange={value => update("redirects", value)} />
						</div>
					</div>
				</ToolPanel>

				<ToolPanel title="Caching & compression" icon={Zap}>
					<div className="space-y-3 p-4">
						<Checkbox checked={config.browserCaching} onChange={value => update("browserCaching", value)} label="Enable browser caching" />
						{config.browserCaching && (
							<div className="pl-6">
								<label className="block text-xs font-medium text-muted-foreground">Cache max age (days)</label>
								<input
									type="number"
									min={1}
									value={config.cacheMaxAgeDays}
									onChange={event => update("cacheMaxAgeDays", Number(event.target.value) || 1)}
									className={`mt-1 w-32 ${inputClasses}`}
								/>
							</div>
						)}
						<Checkbox checked={config.gzipCompression} onChange={value => update("gzipCompression", value)} label="Gzip compression" />
						<Checkbox
							checked={config.brotliCompression}
							onChange={value => update("brotliCompression", value)}
							label="Brotli compression (requires mod_brotli — not available on every host)"
						/>
					</div>
				</ToolPanel>
			</div>

			<div className="space-y-4">
				<ToolPanel title="Security headers" icon={Shield}>
					<div className="space-y-3 p-4">
						<Checkbox
							checked={config.securityHeaders.xContentTypeOptions}
							onChange={value => updateSecurity("xContentTypeOptions", value)}
							label="X-Content-Type-Options"
						/>
						<Checkbox checked={config.securityHeaders.xFrameOptions} onChange={value => updateSecurity("xFrameOptions", value)} label="X-Frame-Options" />
						<Checkbox
							checked={config.securityHeaders.referrerPolicy}
							onChange={value => updateSecurity("referrerPolicy", value)}
							label="Referrer-Policy"
						/>
						<Checkbox
							checked={config.securityHeaders.contentSecurityPolicy}
							onChange={value => updateSecurity("contentSecurityPolicy", value)}
							label="Content-Security-Policy"
						/>

						{config.securityHeaders.contentSecurityPolicy && (
							<div className="space-y-2 pl-6">
								<ToolAlert variant="warning" icon={AlertTriangle}>
									A wrong CSP value can silently break scripts, styles, or images on your site. Test thoroughly before deploying to production.
								</ToolAlert>
								<input
									value={config.securityHeaders.contentSecurityPolicyValue}
									onChange={event => updateSecurity("contentSecurityPolicyValue", event.target.value)}
									placeholder="default-src 'self'"
									className={inputClasses}
								/>
							</div>
						)}

						<div>
							<label className="block text-xs font-medium text-muted-foreground">Custom directives</label>
							<textarea
								value={config.customDirectives}
								onChange={event => update("customDirectives", event.target.value)}
								placeholder="# Anything you want appended verbatim"
								rows={4}
								spellCheck={false}
								className={`mt-1 resize-y ${inputClasses}`}
							/>
						</div>

						<Button onClick={() => setConfig(DEFAULT_APACHE_CONFIG)} variant="ghost" size="sm" className="text-destructive hover:bg-destructive-muted">
							<Trash2 className="size-3.5" />
							Reset to defaults
						</Button>
					</div>
				</ToolPanel>
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
				<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
					<span className="text-sm font-medium">.htaccess</span>
					<div className="flex items-center gap-2">
						<CopyButton value={output} ariaLabel="Copy .htaccess" disabled={!output} />
						<Button onClick={() => downloadTextFile(output, ".htaccess", "text/plain")} variant="outline" size="sm" disabled={!output}>
							Download
						</Button>
					</div>
				</div>

				{output ? (
					<CodeEditor value={output} onChange={() => {}} language="shell" readOnly height="360px" />
				) : (
					<p className="px-4 py-8 text-center text-sm text-muted-foreground">Enable an option above to generate your .htaccess file.</p>
				)}
			</div>
		</div>
	);
}
