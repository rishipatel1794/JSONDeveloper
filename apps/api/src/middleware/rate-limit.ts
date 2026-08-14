import rateLimit from "express-rate-limit";

/**
 * In-memory, per-IP limiter — sufficient for a single-instance V1 deployment. A distributed
 * deployment (multiple API instances behind a load balancer) should swap the store for a shared
 * one (e.g. Redis via rate-limit-redis) so limits are enforced consistently across instances.
 */
export const proxyRateLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 30,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (_req, res) => {
		res.status(429).json({
			success: false,
			status: 0,
			statusText: "",
			headers: {},
			body: "",
			contentType: "",
			size: 0,
			duration: 0,
			error: "Too many requests. Please try again shortly.",
		});
	},
});
