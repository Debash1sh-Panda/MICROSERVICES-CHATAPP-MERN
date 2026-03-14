import { Router } from "express";
import { createNewChat, getAllChats, getMessagesByChat, sendMessage } from "../controllers/chat.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = Router();

router.post("/create", isAuth, createNewChat);
router.get("/all", isAuth, getAllChats);
router.post("/message", isAuth, upload.single("image"), sendMessage);
router.get("/message-by-chat/:chatId", isAuth, getMessagesByChat);

export default router;
