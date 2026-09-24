"use client";

import { useState, type FormEvent } from "react";
import { Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface SecurityAuditFormProps {
	onSubmit: (url: string) => void;
	isLoading: boolean;
}

function normalizeUrl(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

	try {
		const parsed = new URL(withProtocol);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
		return parsed.toString();
	} catch {
		return null;
	}
}

export function SecurityAuditForm({ onSubmit, isLoading }: SecurityAuditFormProps) {
	const [value, setValue] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const normalized = normalizeUrl(value);
		if (!normalized) {
			setValidationError("Enter a valid website address, e.g. https://example.com");
			return;
		}

		setValidationError(null);
		onSubmit(normalized);
	}

	return (
		<div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
			<form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
				<div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--color-primary)_/_15%]">
					<Search className="size-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
					<input
						type="text"
						inputMode="url"
						value={value}
						onChange={event => setValue(event.target.value)}
						placeholder="https://example.com"
						aria-label="Website URL to audit"
						autoComplete="off"
						className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
					/>
				</div>

				<Button type="submit" size="md" disabled={isLoading}>
					<ShieldCheck className="size-4" />
					{isLoading ? "Analyzing…" : "Analyze"}
				</Button>
			</form>

			{validationError && <p className="mt-2 text-sm text-destructive">{validationError}</p>}

			<p className="mt-3 text-xs leading-relaxed text-subtle-foreground">
				Only publicly accessible information is analyzed. No credentials or login access is required. This tool performs a passive
				security audit of publicly accessible website information — do not enter passwords, API keys, private URLs, or confidential
				information.
			</p>
		</div>
	);
}
