"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { SkippedEndpoint } from "@/lib/api-client/import/types";

interface OpenApiImportResultProps {
	collectionName: string;
	requestCount: number;
	folderCount: number;
	variableCount: number;
	skippedCount: number;
	skippedDetails: SkippedEndpoint[];
	onOpenCollection: () => void;
	onClose: () => void;
}

export function OpenApiImportResult({
	collectionName,
	requestCount,
	folderCount,
	variableCount,
	skippedCount,
	skippedDetails,
	onOpenCollection,
	onClose,
}: OpenApiImportResultProps) {
	const [showDetails, setShowDetails] = useState(false);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 text-success">
				<CheckCircle2 className="size-5" />
				<p className="text-sm font-semibold">{skippedCount > 0 ? "Import completed with warnings" : "API imported successfully"}</p>
			</div>

			<div className="rounded-md border border-border p-3 text-sm">
				<p className="font-medium text-foreground">{collectionName}</p>
				<ul className="mt-2 space-y-1 text-muted-foreground">
					<li>
						{requestCount} request{requestCount === 1 ? "" : "s"} imported
					</li>
					<li>
						{folderCount} folder{folderCount === 1 ? "" : "s"} created
					</li>
					{variableCount > 0 && (
						<li>
							{variableCount} variable{variableCount === 1 ? "" : "s"} configured
						</li>
					)}
				</ul>
			</div>

			{skippedCount > 0 && (
				<div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
					<p className="flex items-center gap-1.5 font-medium">
						<AlertTriangle className="size-4" />
						{skippedCount} endpoint{skippedCount === 1 ? "" : "s"} skipped
					</p>

					{skippedDetails.length > 0 && (
						<>
							<button type="button" onClick={() => setShowDetails(current => !current)} className="mt-1.5 text-xs underline">
								{showDetails ? "Hide" : "View"} details
							</button>

							{showDetails && (
								<ul className="mt-2 space-y-1.5 border-t border-warning/30 pt-2 text-xs">
									{skippedDetails.map((item, index) => (
										<li key={index}>
											<span className="font-mono">
												{item.method} {item.path}
											</span>
											<br />
											Reason: {item.reason}
										</li>
									))}
								</ul>
							)}
						</>
					)}
				</div>
			)}

			<div className="flex justify-end gap-2">
				<Button onClick={onClose} variant="ghost">
					Close
				</Button>
				<Button onClick={onOpenCollection}>Open Collection</Button>
			</div>
		</div>
	);
}
