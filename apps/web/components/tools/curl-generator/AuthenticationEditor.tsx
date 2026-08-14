import type { AuthConfig } from "@/lib/tools/curl/types";
import { cn } from "@/lib/utils";

const AUTH_TYPES: { value: AuthConfig["type"]; label: string }[] = [
	{ value: "none", label: "No Auth" },
	{ value: "bearer", label: "Bearer Token" },
	{ value: "basic", label: "Basic Auth" },
	{ value: "api-key", label: "API Key" },
];

const inputClasses =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface AuthenticationEditorProps {
	auth: AuthConfig;
	onChange: (auth: AuthConfig) => void;
}

export function AuthenticationEditor({ auth, onChange }: AuthenticationEditorProps) {
	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Authentication type">
				{AUTH_TYPES.map(option => (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={auth.type === option.value}
						onClick={() => onChange(toDefaultAuth(option.value))}
						className={cn(
							"rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							auth.type === option.value
								? "border-primary/40 bg-primary/10 text-primary-accent"
								: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
						)}
					>
						{option.label}
					</button>
				))}
			</div>

			{auth.type === "none" && <p className="text-sm text-muted-foreground">No authentication will be added to this request.</p>}

			{auth.type === "bearer" && (
				<Field label="Token">
					<input
						type="text"
						value={auth.token}
						onChange={event => onChange({ type: "bearer", token: event.target.value })}
						placeholder="your-token-here"
						spellCheck={false}
						className={inputClasses}
					/>
				</Field>
			)}

			{auth.type === "basic" && (
				<div className="grid gap-3 sm:grid-cols-2">
					<Field label="Username">
						<input
							type="text"
							value={auth.username}
							onChange={event => onChange({ ...auth, username: event.target.value })}
							spellCheck={false}
							className={inputClasses}
						/>
					</Field>
					<Field label="Password">
						<input
							type="password"
							value={auth.password}
							onChange={event => onChange({ ...auth, password: event.target.value })}
							className={inputClasses}
						/>
					</Field>
				</div>
			)}

			{auth.type === "api-key" && (
				<div className="grid gap-3 sm:grid-cols-3">
					<Field label="Key Name">
						<input
							type="text"
							value={auth.key}
							onChange={event => onChange({ ...auth, key: event.target.value })}
							placeholder="X-API-Key"
							spellCheck={false}
							className={inputClasses}
						/>
					</Field>
					<Field label="Key Value">
						<input
							type="text"
							value={auth.value}
							onChange={event => onChange({ ...auth, value: event.target.value })}
							spellCheck={false}
							className={inputClasses}
						/>
					</Field>
					<Field label="Location">
						<select
							value={auth.location}
							onChange={event => onChange({ ...auth, location: event.target.value as "header" | "query" })}
							className={inputClasses}
						>
							<option value="header">Header</option>
							<option value="query">Query Parameter</option>
						</select>
					</Field>
				</div>
			)}
		</div>
	);
}

function toDefaultAuth(type: AuthConfig["type"]): AuthConfig {
	switch (type) {
		case "bearer":
			return { type: "bearer", token: "" };
		case "basic":
			return { type: "basic", username: "", password: "" };
		case "api-key":
			return { type: "api-key", key: "", value: "", location: "header" };
		default:
			return { type: "none" };
	}
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
			{children}
		</label>
	);
}
