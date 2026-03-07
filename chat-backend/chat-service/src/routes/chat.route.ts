import { Router } from "express";
import { createNewChat, getAllChats } from "../controllers/chat.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
const router = Router();

router.post("/create", isAuth, createNewChat);
router.post("/all", isAuth, getAllChats);

export default router;
