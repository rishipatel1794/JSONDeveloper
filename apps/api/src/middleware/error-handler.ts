import type { NextFunction, Request, Response } from "express";

function isPayloadTooLarge(err: unknown): boolean {
	return typeof err === "object" && err !== null && "type" in err && (err as { type?: unknown }).type === "entity.too.large";
}

// Express only recognizes this as error-handling middleware because it declares exactly 4 params.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- _next must stay declared for that arity check, even though it's never called
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
	if (res.headersSent) return;

	const envelope = {
		success: false,
		status: 0,
		statusText: "",
		headers: {},
		body: "",
		contentType: "",
		size: 0,
		duration: 0,
	};

	if (isPayloadTooLarge(err)) {
		res.status(413).json({ ...envelope, error: "Request body is too large." });
		return;
	}

	// Never forward err.message/err.stack to the client — it can leak internal implementation details.
	res.status(500).json({ ...envelope, error: "The API request could not be completed." });
}
