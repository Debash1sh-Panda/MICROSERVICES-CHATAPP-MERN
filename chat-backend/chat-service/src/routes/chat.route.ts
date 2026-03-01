import { Router } from "express";
import { createNewChat } from "../controllers/chat.controller.js";
const router = Router();

router.post("/create", createNewChat);

export default router;
