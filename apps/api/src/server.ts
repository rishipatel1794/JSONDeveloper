import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import requestRoutes from "./routes/request.routes";

const app = express();

app.disable("x-powered-by");

app.use(
	helmet({
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false,
		hsts: env.isProduction
			? {
				maxAge: 31536000,
				includeSubDomains: true,
				preload: true,
			}
			: false,
		referrerPolicy: {
			policy: "no-referrer",
		},
	}),
);
app.use(cors({ origin: env.webUrl }));
app.use(express.json({ limit: env.maxRequestSize }));
app.use(express.urlencoded({ extended: true, limit: env.maxRequestSize }));
app.use(morgan("dev"));

app.use("/api", (_req, res, next) => {
	res.setHeader("Cache-Control", "no-store");
	res.setHeader("Pragma", "no-cache");
	next();
});

app.get("/api/health", (_req, res) => {
	res.status(200).json({
		success: true,
		message: "API is running",
	});
});

app.use("/api", requestRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
	console.log(`🚀 API running on http://localhost:${env.port}`);
});
