import { Router } from "express";
import chatRoute from "./chat.route.js";
const router = Router();

router.use("/chat", chatRoute);

export default router;
