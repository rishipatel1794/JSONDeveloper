"use client";

import { useMemo, useState } from "react";
import { Globe, Lock, Server, Shield, Trash2, Zap } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { downloadTextFile } from "@/lib/download";
import { generateNginxConfig } from "@/lib/tools/nginx/nginx-generator";
import { DEFAULT_NGINX_CONFIG, type NginxConfig } from "@/lib/tools/nginx/types";

const inputClasses =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const selectClasses =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<label className="block text-xs font-medium text-muted-foreground">{label}</label>
			<div className="mt-1">{children}</div>
		</div>
	);
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
	return (
		<label className="flex items-center gap-2 text-sm text-foreground">
			<input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="size-4 rounded border-border accent-primary" />
			{label}
		</label>
	);
}

const BACKEND_EXAMPLES = [
	{ label: "Next.js / Node.js (3000)", value: "http://127.0.0.1:3000" },
	{ label: "Express (5000)", value: "http://127.0.0.1:5000" },
];

export function NginxConfigGenerator() {
	const [config, setConfig] = useState<NginxConfig>(DEFAULT_NGINX_CONFIG);
	const output = useMemo(() => generateNginxConfig(config), [config]);

	function update<K extends keyof NginxConfig>(key: K, value: NginxConfig[K]) {
		setConfig(previous => ({ ...previous, [key]: value }));
	}

	function updateSsl<K extends keyof NginxConfig["ssl"]>(key: K, value: NginxConfig["ssl"][K]) {
		setConfig(previous => ({ ...previous, ssl: { ...previous.ssl, [key]: value } }));
	}

	function updateProxyHeaders<K extends keyof NginxConfig["proxyHeaders"]>(key: K, value: NginxConfig["proxyHeaders"][K]) {
		setConfig(previous => ({ ...previous, proxyHeaders: { ...previous.proxyHeaders, [key]: value } }));
	}

	function updateSecurity<K extends keyof NginxConfig["securityHeaders"]>(key: K, value: NginxConfig["securityHeaders"][K]) {
		setConfig(previous => ({ ...previous, securityHeaders: { ...previous.securityHeaders, [key]: value } }));
	}

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<div className="space-y-4">
				<ToolPanel title="Basic" icon={Server}>
					<div className="space-y-3 p-4">
						<Field label="Server name (domain)">
							<input value={config.serverName} onChange={event => update("serverName", event.target.value)} className={inputClasses} />
						</Field>

						<Field label="Mode">
							<select value={config.mode} onChange={event => update("mode", event.target.value as NginxConfig["mode"])} className={selectClasses}>
								<option value="reverse-proxy">Reverse proxy</option>
								<option value="static">Static website</option>
							</select>
						</Field>

						{config.mode === "static" ? (
							<Field label="Root directory">
								<input value={config.root} onChange={event => update("root", event.target.value)} className={inputClasses} />
							</Field>
						) : (
							<>
								<Field label="Backend URL">
									<input value={config.backendUrl} onChange={event => update("backendUrl", event.target.value)} className={inputClasses} />
								</Field>
								<div className="flex flex-wrap gap-1.5">
									{BACKEND_EXAMPLES.map(example => (
										<button
											key={example.value}
											type="button"
											onClick={() => update("backendUrl", example.value)}
											className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
										>
											{example.label}
										</button>
									))}
								</div>
								<div className="space-y-2 pt-1">
									<Checkbox checked={config.proxyHeaders.host} onChange={value => updateProxyHeaders("host", value)} label="Host header" />
									<Checkbox checked={config.proxyHeaders.realIp} onChange={value => updateProxyHeaders("realIp", value)} label="X-Real-IP" />
									<Checkbox
										checked={config.proxyHeaders.forwardedFor}
										onChange={value => updateProxyHeaders("forwardedFor", value)}
										label="X-Forwarded-For"
									/>
									<Checkbox
										checked={config.proxyHeaders.forwardedProto}
										onChange={value => updateProxyHeaders("forwardedProto", value)}
										label="X-Forwarded-Proto"
									/>
								</div>
							</>
						)}

						{!config.ssl.enabled && (
							<Field label="Listen port">
								<input
									type="number"
									value={config.listenPort}
									onChange={event => update("listenPort", Number(event.target.value) || 80)}
									className={inputClasses}
								/>
							</Field>
						)}
					</div>
				</ToolPanel>

				<ToolPanel title="SSL / HTTPS" icon={Lock}>
					<div className="space-y-3 p-4">
						<Checkbox checked={config.ssl.enabled} onChange={value => updateSsl("enabled", value)} label="Enable HTTPS" />
						{config.ssl.enabled && (
							<div className="space-y-3 pl-6">
								<Field label="Certificate path">
									<input value={config.ssl.certPath} onChange={event => updateSsl("certPath", event.target.value)} className={inputClasses} />
								</Field>
								<Field label="Certificate key path">
									<input value={config.ssl.keyPath} onChange={event => updateSsl("keyPath", event.target.value)} className={inputClasses} />
								</Field>
								<Checkbox
									checked={config.ssl.redirectHttpToHttps}
									onChange={value => updateSsl("redirectHttpToHttps", value)}
									label="Redirect HTTP → HTTPS"
								/>
							</div>
						)}
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
					</div>
				</ToolPanel>

				<ToolPanel title="Caching & gzip" icon={Zap}>
					<div className="space-y-3 p-4">
						<Checkbox checked={config.caching.enabled} onChange={value => update("caching", { ...config.caching, enabled: value })} label="Cache static assets" />
						{config.caching.enabled && (
							<div className="pl-6">
								<Field label="Cache max age (days)">
									<input
										type="number"
										min={1}
										value={config.caching.maxAgeDays}
										onChange={event => update("caching", { ...config.caching, maxAgeDays: Number(event.target.value) || 1 })}
										className={`w-32 ${inputClasses}`}
									/>
								</Field>
							</div>
						)}
						<Checkbox checked={config.gzip} onChange={value => update("gzip", value)} label="Enable gzip" />

						<Button onClick={() => setConfig(DEFAULT_NGINX_CONFIG)} variant="ghost" size="sm" className="text-destructive hover:bg-destructive-muted">
							<Trash2 className="size-3.5" />
							Reset to defaults
						</Button>
					</div>
				</ToolPanel>

				<ToolPanel title="Summary" icon={Globe}>
					<p className="px-4 py-3 text-sm text-muted-foreground">
						{config.mode === "static" ? "Serving static files from " : "Reverse-proxying to "}
						<code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">{config.mode === "static" ? config.root : config.backendUrl}</code>
						{" for "}
						<code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">{config.serverName}</code>
						{config.ssl.enabled ? ", over HTTPS." : ", over plain HTTP."}
					</p>
				</ToolPanel>
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
				<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
					<span className="text-sm font-medium">nginx.conf</span>
					<div className="flex items-center gap-2">
						<CopyButton value={output} ariaLabel="Copy nginx config" />
						<Button onClick={() => downloadTextFile(output, "nginx.conf", "text/plain")} variant="outline" size="sm">
							Download
						</Button>
					</div>
				</div>

				<CodeEditor value={output} onChange={() => {}} language="shell" readOnly height="380px" />
			</div>
		</div>
	);
}
