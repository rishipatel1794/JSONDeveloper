import { AlertTriangle, ChevronDown } from "lucide-react";

interface CurlOptionsProps {
	followRedirects: boolean;
	onFollowRedirectsChange: (value: boolean) => void;
	compressed: boolean;
	onCompressedChange: (value: boolean) => void;
	insecure: boolean;
	onInsecureChange: (value: boolean) => void;
	cookies: string;
	onCookiesChange: (value: string) => void;
	userAgent: string;
	onUserAgentChange: (value: string) => void;
}

const inputClasses =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CurlOptions({
	followRedirects,
	onFollowRedirectsChange,
	compressed,
	onCompressedChange,
	insecure,
	onInsecureChange,
	cookies,
	onCookiesChange,
	userAgent,
	onUserAgentChange,
}: CurlOptionsProps) {
	return (
		<details className="group rounded-md border border-border bg-background">
			<summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium text-foreground">
				Advanced cURL Options
				<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
			</summary>

			<div className="space-y-4 border-t border-border-subtle px-3 py-3">
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					<Checkbox label="Follow redirects" checked={followRedirects} onChange={onFollowRedirectsChange} />
					<Checkbox label="Compressed response" checked={compressed} onChange={onCompressedChange} />
					<Checkbox label="Skip TLS certificate verification" checked={insecure} onChange={onInsecureChange} />
				</div>

				{insecure && (
					<p className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
						<AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
						Skipping TLS verification is insecure and should only be used when you understand the consequences.
					</p>
				)}

				<div className="grid gap-3 sm:grid-cols-2">
					<label className="block">
						<span className="mb-1 block text-xs font-medium text-muted-foreground">Cookie</span>
						<input
							type="text"
							value={cookies}
							onChange={event => onCookiesChange(event.target.value)}
							placeholder="session=abc123"
							spellCheck={false}
							className={inputClasses}
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-xs font-medium text-muted-foreground">User-Agent</span>
						<input
							type="text"
							value={userAgent}
							onChange={event => onUserAgentChange(event.target.value)}
							placeholder="MyApp/1.0"
							spellCheck={false}
							className={inputClasses}
						/>
					</label>
				</div>
			</div>
		</details>
	);
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
	return (
		<label className="inline-flex items-center gap-2 text-sm text-foreground">
			<input
				type="checkbox"
				checked={checked}
				onChange={event => onChange(event.target.checked)}
				className="size-4 rounded border-border accent-primary"
			/>
			{label}
		</label>
	);
}
