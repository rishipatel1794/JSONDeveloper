"use client";

import { useState } from "react";

import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { Button } from "@/components/ui/Button";

interface ImportCurlDialogProps {
	onImport: (command: string) => string | undefined;
}

export function ImportCurlDialog({ onImport }: ImportCurlDialogProps) {
	const [command, setCommand] = useState("");
	const [error, setError] = useState("");

	function handleParse() {
		const errorMessage = onImport(command);
		setError(errorMessage ?? "");
	}

	return (
		<div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
			<div>
				<label htmlFor="curl-import" className="mb-1.5 block text-sm font-medium">
					Paste a cURL command
				</label>
				<textarea
					id="curl-import"
					value={command}
					onChange={event => setCommand(event.target.value)}
					placeholder={"curl --request GET \\\n  --url 'https://api.example.com/users?page=1' \\\n  --header 'Authorization: Bearer TOKEN'"}
					spellCheck={false}
					rows={8}
					className="w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>

			{error && <ToolAlert variant="error">{error}</ToolAlert>}

			<Button onClick={handleParse} disabled={!command.trim()}>
				Parse cURL
			</Button>
		</div>
	);
}
