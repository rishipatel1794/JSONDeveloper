import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import { currentUnixTimestamp, EXPIRATION_PRESETS } from "@/lib/tools/jwt-generator/defaults";

interface JwtGeneratorPayloadPanelProps {
	value: string;
	onChange: (value: string) => void;
	error: string | null;
	onApplyClaim: (claim: string, applyValue: unknown) => void;
}

const inputClass =
	"w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function JwtGeneratorPayloadPanel({ value, onChange, error, onApplyClaim }: JwtGeneratorPayloadPanelProps) {
	return (
		<ToolPanel
			title="Payload"
			icon={ClipboardList}
			footer={
				<div className="space-y-3 p-3">
					<p className="text-xs font-medium text-muted-foreground">Claim helpers — each button edits the payload JSON above</p>
					<div className="grid gap-2 sm:grid-cols-2">
						<ClaimTextInput label="Issuer (iss)" placeholder="https://auth.example.com" onApply={value => onApplyClaim("iss", value)} />
						<ClaimTextInput label="Subject (sub)" placeholder="user-id-123" onApply={value => onApplyClaim("sub", value)} />
						<ClaimTextInput label="Audience (aud)" placeholder="my-api" onApply={value => onApplyClaim("aud", value)} />
						<ClaimTextInput label="JWT ID (jti)" placeholder="unique-token-id" onApply={value => onApplyClaim("jti", value)} />
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onApplyClaim("iat", currentUnixTimestamp())}
						>
							Set iat to now
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onApplyClaim("nbf", currentUnixTimestamp())}
						>
							Set nbf to now
						</Button>
						{EXPIRATION_PRESETS.map(preset => (
							<Button
								key={preset.label}
								type="button"
								variant="outline"
								size="sm"
								onClick={() => onApplyClaim("exp", currentUnixTimestamp() + preset.seconds)}
							>
								Expire in {preset.label}
							</Button>
						))}
					</div>
				</div>
			}
		>
			<CodeEditor value={value} onChange={onChange} height="220px" />
			{error && <p className="border-t border-destructive-border bg-destructive-muted px-3 py-2 text-xs text-destructive-muted-foreground">{error}</p>}
		</ToolPanel>
	);
}

function ClaimTextInput({ label, placeholder, onApply }: { label: string; placeholder: string; onApply: (value: string) => void }) {
	return (
		<div className="flex items-end gap-1.5">
			<div className="flex-1">
				<label className="mb-1 block text-xs text-subtle-foreground">{label}</label>
				<input
					type="text"
					placeholder={placeholder}
					className={inputClass}
					onKeyDown={event => {
						if (event.key === "Enter") {
							event.preventDefault();
							onApply(event.currentTarget.value);
						}
					}}
					onBlur={event => {
						if (event.currentTarget.value) onApply(event.currentTarget.value);
					}}
				/>
			</div>
		</div>
	);
}
