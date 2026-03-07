import axios from "axios";
import type { AuthenticationRequest } from "../middlewares/isAuth.middleware.js";
import { Chat } from "../models/chat.model.js";
import { Messages } from "../models/message.model.js";
import TryCatch from "../utils/tryCatchHandler.utils.js";

export const createNewChat = TryCatch(
  async (req: AuthenticationRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other userid is required",
      });
    }

    const existingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId], $size: 2 },
    });

    if (existingChat) {
      return res.status(200).json({
        success: true,
        message: "Chat already exist",
        chatId: existingChat._id,
      });
    }

    const newChat = await Chat.create({
      users: [userId, otherUserId],
    });

    return res.status(201).json({
      success: true,
      message: "New chat created",
      chatId: newChat._id,
    });
  },
);

export const getAllChats = TryCatch(async (req: AuthenticationRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Userid is required",
    });
  }

  const chats = await Chat.find({ users: userId }).sort({
    updatedAt: -1,
  });

  if (!chats || chats.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No chat found",
    });
  }

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);

      const unseenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        isRead: false,
      });

      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
        );

        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      } catch (error) {
        console.error(error);
        return {
          user: { _id: otherUserId, name: "Unknown user" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      }
    }),
  );

  return res.status(200).json({
    success: true,
    message: "All chat fetched",
    data: chatWithUserData,
  });
});

