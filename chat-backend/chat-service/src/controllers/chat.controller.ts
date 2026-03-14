import axios from "axios";
import type { AuthenticationRequest } from "../middlewares/isAuth.middleware.js";
import { Chat } from "../models/chat.model.js";
import { Messages } from "../models/message.model.js";
import TryCatch from "../utils/tryCatchHandler.utils.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.utils.js";

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

export const sendMessage = TryCatch(async (req: AuthenticationRequest, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imageFile = req.file;

  if (!senderId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: "chatId is required",
    });
  }

  // allow text OR image
  if (!text || !imageFile) {
    return res.status(400).json({
      success: false,
      message: "Either text or image is required",
    });
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: "Chat not found",
    });
  }

  const isUserInChat = chat.users.some(
    (u) => u.toString() === senderId.toString(),
  );

  if (!isUserInChat) {
    return res.status(400).json({
      success: false,
      message: "You are not a participant of this chat",
    });
  }

  const otherUserId = chat.users.find(
    (u) => u.toString() !== senderId.toString(),
  );

  if (!otherUserId) {
    return res.status(400).json({
      success: false,
      message: "No other user",
    });
  }

  //socket setup

  let messageData: any = {
    chatId,
    senderId,
    text,
    isRead: false,
    readAt: undefined,
  };

  if (imageFile) {
    const result = await uploadToCloudinary(imageFile.buffer);

    messageData.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    messageData.messageType = "image";
    messageData.text = text;
  } else {
    messageData.messageType = "text";
    messageData.text = text;
  }

  // Save message
  const message = await Messages.create(messageData);
  const latestMessage = imageFile ? "📸 Image" : text;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: {
        text: latestMessage,
        sender: senderId,
      },
      updatedAt: new Date(),
    },
    { new: true },
  );

  // emit to socket

  return res.status(200).json({
    success: true,
    message: "Message sent",
    data: message,
  });
});

export const getMessagesByChat = TryCatch(
  async (req: AuthenticationRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "chatId is required",
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const isUserInChat = chat.users.some(
      (u) => u.toString() === userId.toString(),
    );

    if (!isUserInChat) {
      return res.status(400).json({
        success: false,
        message: "You are not a participant of this chat",
      });
    }

    const messagesAsMark = await Messages.find({
      chatId,
      sender: { $ne: userId },
      isRead: false,
    });

    await Messages.updateMany(
      {
        chatId,
        sender: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find(
      (u) => u.toString() !== userId.toString(),
    );

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "No other user",
      });
    }

    try {
      const { data } = await axios.get(
        `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
      );

      //socket setup

      return res.status(200).json({
        success: true,
        messge: "chat messages fetched",
        data: messages,
        user: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        messge: "chat messages failed",
        data: null,
        user: { _id: otherUserId, name: "unknown user" },
      });
    }
  },
);
