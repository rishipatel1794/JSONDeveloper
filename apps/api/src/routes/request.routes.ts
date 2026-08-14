import { Router, type Router as RouterType } from "express";

import { handleProxyRequest } from "../controllers/request.controller";
import { proxyRateLimiter } from "../middleware/rate-limit";

const router: RouterType = Router();

router.post("/request", proxyRateLimiter, handleProxyRequest);

export default router;
