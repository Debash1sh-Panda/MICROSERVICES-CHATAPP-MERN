import type { AuthenticationRequest } from "../middlewares/isAuth.middleware.js";
import { Chat } from "../models/chat.model.js";
import TryCatch from "../utils/tryCatchHandler.utils.js";

export const createNewChat = TryCatch(
  async (req: AuthenticationRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      res.status(400).json({
        success: false,
        message: "Other userid is required",
      });
    }

    const existingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId], $size: 2 },
    });

    if (existingChat) {
      res.status(200).json({
        success: true,
        message: "Chat already exist",
        chatId: existingChat._id,
      });
    }

    const newChat = await Chat.create({
      users: [userId, otherUserId],
    });

    res.status(201).json({
      success: true,
      message: "New chat created",
      chatId: newChat._id,
    });
  },
);
