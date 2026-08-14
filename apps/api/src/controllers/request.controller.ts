import type { Request, Response } from "express";

import { executeProxyRequest } from "../services/request.service";
import { apiRequestSchema } from "../validators/request.validator";

const EMPTY_ENVELOPE = {
	status: 0,
	statusText: "",
	headers: {} as Record<string, string>,
	body: "",
	contentType: "",
	size: 0,
	duration: 0,
};

export async function handleProxyRequest(req: Request, res: Response): Promise<void> {
	// Never log req.body here — it may contain Authorization headers, tokens, or passwords.
	const parsed = apiRequestSchema.safeParse(req.body);

	if (!parsed.success) {
		// Surface the URL field's custom message when that's the only problem (the common case of an
		// empty/missing URL) — otherwise fall back to a generic message rather than leaking schema internals.
		const onlyIssue = parsed.error.issues.length === 1 ? parsed.error.issues[0] : undefined;
		const isUrlIssue = onlyIssue?.path.length === 1 && onlyIssue.path[0] === "url";

		res.status(400).json({
			success: false,
			...EMPTY_ENVELOPE,
			error: isUrlIssue ? onlyIssue.message : "Invalid request configuration.",
		});
		return;
	}

	try {
		const result = await executeProxyRequest(parsed.data);
		res.status(result.httpStatus).json(result.body);
	} catch {
		res.status(500).json({ success: false, ...EMPTY_ENVELOPE, error: "The API request could not be completed." });
	}
}
